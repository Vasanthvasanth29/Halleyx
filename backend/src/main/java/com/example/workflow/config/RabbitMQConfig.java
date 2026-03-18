package com.example.workflow.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE_NAME = "workflow.exchange";
    
    // Auth Queues
    public static final String REGISTRATION_QUEUE = "user.registration.queue";
    public static final String NOTIFICATION_QUEUE = "notification.queue";
    public static final String REGISTRATION_ROUTING_KEY = "user.registered";

    // Workflow Engine Queues
    public static final String WORKFLOW_EXECUTION_QUEUE = "workflow.execution";
    public static final String WORKFLOW_NOTIFICATION_QUEUE = "workflow.execution.notification";
    
    public static final String WORKFLOW_EXECUTION_ROUTING_KEY = "workflow.execution.event";
    public static final String WORKFLOW_NOTIFICATION_ROUTING_KEY = "workflow.notification.event";
    
    // Generic Workflow Events (requested)
    public static final String WORKFLOW_EVENTS_QUEUE = "workflow.events";
    public static final String WORKFLOW_EVENTS_ROUTING_KEY = "workflow.#"; // Catch all workflow events

    @Bean
    public Queue registrationQueue() {
        return new Queue(REGISTRATION_QUEUE, true);
    }

    @Bean
    public Queue notificationQueue() {
        return new Queue(NOTIFICATION_QUEUE, true);
    }
    
    @Bean
    public Queue workflowExecutionQueue() {
        return new Queue(WORKFLOW_EXECUTION_QUEUE, true);
    }
    
    @Bean
    public Queue workflowNotificationQueue() {
        return new Queue(WORKFLOW_NOTIFICATION_QUEUE, true);
    }

    @Bean
    public Queue workflowEventsQueue() {
        return new Queue(WORKFLOW_EVENTS_QUEUE, true);
    }

    @Bean
    public TopicExchange exchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    @Bean
    public Binding bindingRegistration(Queue registrationQueue, TopicExchange exchange) {
        return BindingBuilder.bind(registrationQueue).to(exchange).with(REGISTRATION_ROUTING_KEY);
    }

    @Bean
    public Binding bindingNotification(Queue notificationQueue, TopicExchange exchange) {
        return BindingBuilder.bind(notificationQueue).to(exchange).with(REGISTRATION_ROUTING_KEY);
    }
    
    @Bean
    public Binding bindingWorkflowExecution(Queue workflowExecutionQueue, TopicExchange exchange) {
        return BindingBuilder.bind(workflowExecutionQueue).to(exchange).with(WORKFLOW_EXECUTION_ROUTING_KEY);
    }
    
    @Bean
    public Binding bindingWorkflowNotification(Queue workflowNotificationQueue, TopicExchange exchange) {
        return BindingBuilder.bind(workflowNotificationQueue).to(exchange).with(WORKFLOW_NOTIFICATION_ROUTING_KEY);
    }

    @Bean
    public Binding bindingWorkflowEvents(Queue workflowEventsQueue, TopicExchange exchange) {
        return BindingBuilder.bind(workflowEventsQueue).to(exchange).with(WORKFLOW_EVENTS_ROUTING_KEY);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
