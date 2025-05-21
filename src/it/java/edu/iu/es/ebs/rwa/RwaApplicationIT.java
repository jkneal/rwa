package edu.iu.es.ebs.rwa;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

@SpringBootTest
@TestPropertySource(value = "classpath:/launchpad-base-config.properties")
public class RwaApplicationIT {

    @Test
    public void contextLoads() {
    }

}
