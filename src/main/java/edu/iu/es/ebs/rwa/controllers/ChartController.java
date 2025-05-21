package edu.iu.es.ebs.rwa.controllers;

import edu.iu.es.ebs.rwa.domain.Chart;
import edu.iu.es.ebs.rwa.service.ChartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/charts")
public class ChartController {

    @Autowired
    private ChartService chartService;

    @RequestMapping(value="/", method= RequestMethod.GET)
    public List<Chart> getCharts() {
        return chartService.getCharts();
    }
}
