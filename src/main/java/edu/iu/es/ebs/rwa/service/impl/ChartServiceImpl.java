package edu.iu.es.ebs.rwa.service.impl;

import edu.iu.es.ebs.rwa.domain.Chart;
import edu.iu.es.ebs.rwa.service.ChartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.hateoas.EntityModel;
import org.springframework.hateoas.PagedModel;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service("chartService")
public class ChartServiceImpl implements ChartService {
    @Value("${coai.url}")
    private String coaiUrl;

    @Autowired
    @Qualifier("clientCredentialRestTemplate")
    private RestTemplate restTemplate;

    @Override
    @Cacheable("charts")
    public List<Chart> getCharts() {
        ResponseEntity<PagedModel<EntityModel<Chart>>> chartResponse = restTemplate
                .exchange(coaiUrl +"/api/coa/charts", HttpMethod.GET, null, new ParameterizedTypeReference<>() {});

        return Objects.requireNonNull(chartResponse.getBody())
                .getContent().stream()
                .map(EntityModel::getContent)
                .collect(Collectors.toList());
    }

    public final class Cache {

        public static final String CHARTS = "charts";

        private Cache() {}
    }
}
