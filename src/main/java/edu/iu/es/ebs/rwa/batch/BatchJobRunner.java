package edu.iu.es.ebs.rwa.batch;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Component
@Slf4j
@Profile("batch")
public class BatchJobRunner implements ApplicationContextAware, CommandLineRunner {

    @Autowired
    private ScheduledExecutorService executorService;

    @Autowired
    private List<BatchJob> jobs;

    private ConfigurableApplicationContext applicationContext;

    @Override
    public void run(String... args) throws Exception {
        for (BatchJob job : this.jobs) {
            CompletableFuture.runAsync(() -> {
                try {
                    job.run();
                } catch (Throwable e) {
                    log.error(String.format("Error executing batch job %s", job.getClass()), e);
                    System.exit(1);
                }
            }, executorService);
        }
        this.executorService.shutdown();
        this.executorService.awaitTermination(Long.MAX_VALUE, TimeUnit.NANOSECONDS);

        applicationContext.close();
    }

    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = (ConfigurableApplicationContext)applicationContext;
    }
}
