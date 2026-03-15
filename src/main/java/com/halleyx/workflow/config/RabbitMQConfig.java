package com.halleyx.workflow.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;

@Configuration
public class RabbitMQConfig {

    @Value("${workflow.queue.steps}")
    private String stepsQueue;

    @Value("${workflow.queue.notifications}")
    private String notificationsQueue;

    @Value("${workflow.queue.approvals}")
    private String approvalsQueue;

    @Value("${workflow.queue.status}")
    private String statusQueue;

    @Bean
    public Queue stepsQueue() {
        return new Queue(stepsQueue);
    }

    @Bean
    public Queue notificationsQueue() {
        return new Queue(notificationsQueue);
    }

    @Bean
    public Queue approvalsQueue() {
        return new Queue(approvalsQueue);
    }

    @Bean
    public Queue statusQueue() {
        return new Queue(statusQueue);
    }

    @Bean
    public TopicExchange workflowExchange() {
        return new TopicExchange("workflow.exchange");
    }

    @Bean
    public Binding stepsBinding(Queue stepsQueue, TopicExchange workflowExchange) {
        return BindingBuilder.bind(stepsQueue).to(workflowExchange).with("workflow.step.#");
    }

    @Bean
    public Binding notificationsBinding(Queue notificationsQueue, TopicExchange workflowExchange) {
        return BindingBuilder.bind(notificationsQueue).to(workflowExchange).with("workflow.notification.#");
    }

    @Bean
    public Binding approvalsBinding(Queue approvalsQueue, TopicExchange workflowExchange) {
        return BindingBuilder.bind(approvalsQueue).to(workflowExchange).with("workflow.approval.#");
    }

    @Bean
    public Binding statusBinding(Queue statusQueue, TopicExchange workflowExchange) {
        return BindingBuilder.bind(statusQueue).to(workflowExchange).with("workflow.status.#");
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        final RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }
}
