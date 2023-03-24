use lambda_http::{request::RequestContext, Request, RequestExt};


pub fn get_username(request: Request) -> Option<String>{
    let req_ctx = request.request_context();
    match req_ctx {
        RequestContext::ApiGatewayV2(inner_ctx) => {
            let authorizer = inner_ctx.authorizer;
            match authorizer {
                Some(inner_auth) => {
                    let jwt = inner_auth.jwt; 
                    match jwt {
                        Some(inner_jwt) => {
                            let email = inner_jwt.claims.get("email");
                            match email {
                                Some(inner_email) => {
                                    return Some(inner_email.to_owned())
                                }
                                _ => {
                                    return None;
                                }
                            }
                        }
                        _ => { 
                            return None;
                        }
                    }
                },
                _ => {
                    return None;
                }
            }
        }
        _ => {
            return None;
        }
    }
}
