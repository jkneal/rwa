package edu.iu.es.ebs.rwa.configuration;

import edu.iu.es.ebs.rwa.service.impl.ChartServiceImpl;
import edu.iu.es.ebs.rwa.service.impl.OrganizationServiceImpl;
import edu.iu.es.ebs.rwa.service.impl.PersonServiceImpl;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.cache.RedisCacheManagerBuilderCustomizer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableCaching
public class CacheConfiguration {

    @Value("${spring.redis.cache.prefix:redis}")
    private String cachePrefix;



    @Bean
    public RedisCacheManagerBuilderCustomizer redisCacheManagerBuilderCustomizer() {
        return (builder) -> {
            Map<String, RedisCacheConfiguration> configurationMap = new HashMap<>();
            configurationMap.put(PersonServiceImpl.Cache.GET_PERSON, getConfiguration(24));
            configurationMap.put(PersonServiceImpl.Cache.GET_PERSON_WITH_JOBS, getConfiguration(24));
            configurationMap.put(PersonServiceImpl.Cache.GET_PERSON_BY_EMPLID, getConfiguration(24));
            configurationMap.put(OrganizationServiceImpl.Cache.ORGANIZATIONS, getConfiguration(8));
            configurationMap.put(ChartServiceImpl.Cache.CHARTS, getConfiguration(8));
            builder.withInitialCacheConfigurations(configurationMap);
        };
    }

    private RedisCacheConfiguration getConfiguration(long expireNumberOfHours) {
        return getConfiguration(expireNumberOfHours, cachePrefix);
    }

    private RedisCacheConfiguration getConfiguration(long expireNumberOfHours, String cacheNamespace) {
        return RedisCacheConfiguration.defaultCacheConfig().entryTtl(Duration.ofHours(expireNumberOfHours))
                .prefixCacheNameWith(cacheNamespace);
    }

}
