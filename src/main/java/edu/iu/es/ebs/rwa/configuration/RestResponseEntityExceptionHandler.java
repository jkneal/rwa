package edu.iu.es.ebs.rwa.configuration;

import edu.iu.es.ebs.rwa.exceptions.AuthorizationException;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@ControllerAdvice
public class RestResponseEntityExceptionHandler extends ResponseEntityExceptionHandler {
    private static final Log LOG = LogFactory.getLog(RestResponseEntityExceptionHandler.class);

    @ExceptionHandler(value = { AuthorizationException.class, AuthorizationException.class })
    public ResponseEntity<Object> handleException (AuthorizationException ex, WebRequest request) {
        LOG.error("Encountered an authorization exception while processing a request", ex);
        String bodyOfResponse = "Not authorized for request: " + ex.getMessage();
        return handleExceptionInternal(ex, bodyOfResponse,
            new HttpHeaders(), HttpStatus.FORBIDDEN, request);
    }

    @ExceptionHandler(value = { RuntimeException.class, RuntimeException.class })
    public ResponseEntity<Object> handleException (RuntimeException ex, WebRequest request) {
        LOG.error("Encountered an unexpected exception while processing a request: ", ex);
        String bodyOfResponse = ex.getMessage();
        return handleExceptionInternal(ex, bodyOfResponse,
            new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR, request);
    }
}
