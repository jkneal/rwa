package edu.iu.es.ebs.rwa.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.view.RedirectView;

@RestController
public class DocHandlerController {

    @RequestMapping(value="/arrangement/handler", method = RequestMethod.GET)
    public RedirectView handler(@RequestParam(value="docId", required=true) String documentId) {
        return new RedirectView("/arrangement/review/"+ documentId);
    }

}
