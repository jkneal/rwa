package edu.iu.es.ebs.rwa.service;

import edu.iu.es.ebs.rwa.domain.Chart;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@TestPropertySource(value = "classpath:/launchpad-base-config.properties")
class ChartServiceIT {

    @Autowired
    ChartService chartService;

    @Test
    void getCharts() {
        List<Chart> charts = chartService.getCharts();
        assertTrue(charts.size() > 0);

        Chart chart = charts.get(0);
        assertNotNull(chart.getCode());
        assertNotNull(chart.getDescription());
    }
}