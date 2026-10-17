package com.wlstore.catalog_service.config;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitConfig {

    public static final String CATALOG_EVENTS_EXCHANGE = "catalog.events";

    /** Exchange do tipo topic, durável: sobrevive a reinício do broker. */
    @Bean
    public TopicExchange catalogEventsExchange() {
        return new TopicExchange(CATALOG_EVENTS_EXCHANGE, true, false);
    }
}