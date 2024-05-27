use lambda_http::{run, service_fn, Body, Error, Request, Response};

/// This is the main body for the function.
/// Write your code inside it.
/// There are some code example in the following URLs:
/// - https://github.com/awslabs/aws-lambda-rust-runtime/tree/main/examples
async fn function_handler(_: Request) -> Result<Response<Body>, Error> {
    // Return something that implements IntoResponse.
    // It will be serialized to the right response event automatically by the runtime
    let config = aws_config::load_from_env().await;
    let client = aws_sdk_sns::Client::new(&config);

    let rsp = client
        .publish()
        .topic_arn(std::env::var("EMAIL_SNS_TOPIC").expect("Expected SNS topic env variable"))
        .message("hello sns!")
        .send()
        .await?;

    println!("Published message: {:?}", rsp);

    let resp = Response::builder()
        .status(200)
        .header("content-type", "text/html")
        .body(Body::Text(String::from("Hello, World!")))
        .map_err(Box::new)?;
    Ok(resp)
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::INFO)
        // disable printing the name of the module in every log line.
        .with_target(false)
        // disabling time is handy because CloudWatch will add the ingestion time.
        .without_time()
        .init();

    run(service_fn(function_handler)).await
}
