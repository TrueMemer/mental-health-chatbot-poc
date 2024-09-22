# Chatbot YAML Specification Documentation

## Table of Contents

1. [Introduction](#1-introduction)
2. [YAML Specification Structure](#2-yaml-specification-structure)
   - [2.1. Flow-Level Fields](#21-flow-level-fields)
   - [2.2. Step-Level Fields](#22-step-level-fields)
   - [2.3. Branch-Level Fields](#23-branch-level-fields)
3. [Example Flows](#3-example-flows)
   - [3.1. Basic Greeting Flow](#31-basic-greeting-flow)
   - [3.2. FAQ Flow](#32-faq-flow)
   - [3.3. Feedback Flow with Branch-Only Steps](#33-feedback-flow-with-branch-only-steps)
   - [3.4. Conditional Branching Based on Keywords](#34-conditional-branching-based-on-keywords)

---

## 1. Introduction

This documentation provides a comprehensive guide to defining chatbot conversation flows using a YAML-based specification centered around **trigger keywords**. By structuring your chatbot flows in YAML, you can create organized, scalable, and maintainable conversation patterns that enhance user interactions.

**Key Features of the YAML Spec:**

- **Trigger Keywords:** Activate flows based on specific user-provided keywords.
- **Flexible Step Handling:** Create steps that can send messages or act solely as branches to other steps without sending messages.
- **Conditional Branching:** Direct the conversation flow based on user input or predefined conditions.
- **Context Management:** Maintain and update conversation context for personalized interactions.

---

## 2. YAML Specification Structure

The YAML specification is organized into **flows**, each comprising multiple **steps**. Each flow is triggered by specific **keywords**, and steps within flows dictate how the conversation progresses.

### 2.1. Flow-Level Fields

Each **flow** defines a conversation path and includes the following fields:

- **`id`** *(string, required)*: A unique identifier for the flow.
- **`trigger_keywords`** *(array of strings, required)*: Keywords that activate the flow.
- **`steps`** *(array of steps, required)*: The sequence of steps that make up the flow.

**Example:**

```yaml
id: greeting_flow
trigger_keywords:
  - hello
  - hi
  - hey
steps:
  # Steps will be defined here
```

### 2.2. Step-Level Fields

Each **step** within a flow defines an action or response in the conversation. Steps can send messages or act solely as branches to other steps without sending messages.

**Fields:**

- **`id`** *(string, required)*: A unique identifier for the step within the flow.
- **`engine`** *(string, required)*: Determines the type of step. Possible values:
  - **`basic`**: Sends a predefined message to the user.
  - **`branch`**: Acts solely as a connector to another step without sending a message.
  - **`ai`**: (Optional) Utilizes AI for processing, such as intent classification.
  - **`nlp`**: (Optional) For advanced NLP processing.
- **`bot`** *(string, optional)*: The message the chatbot sends to the user. Not required for `branch` steps.
- **`user_response_required`** *(boolean, required)*: Indicates whether the bot expects a user response after this step.
- **`branches`** *(array of branches, optional)*: Defines conditional paths based on user input or conditions.
- **`set_context`** *(object, optional)*: Updates conversation context variables.
- **`next_step_id`** *(string, optional)*: Directs the flow to the next step automatically.

**Example:**

```yaml
steps:
  - id: start
    engine: basic
    bot: "Hello! How can I assist you today?"
    user_response_required: true
    branches:
      - condition:
          default: true
        next_step_id: end_conversation
```

### 2.3. Branch-Level Fields

Each **branch** within a step defines a conditional path the conversation can take based on certain conditions.

**Fields:**

- **`condition`** *(object, required)*: The condition that triggers this branch.
  - **`expected_user_keywords`** *(array of strings, optional)*: Keywords expected in the user's message to trigger this branch.
  - **`default`** *(boolean, optional)*: If set to `true`, this branch acts as a fallback when no other conditions are met.
- **`next_step_id`** *(string, required)*: The identifier of the next step to navigate to if the condition is met.
- **`set_context`** *(object, optional)*: Updates conversation context variables upon taking this branch.

**Example:**

```yaml
branches:
  - condition:
      expected_user_keywords:
        - billing
    next_step_id: billing_support
  - condition:
      expected_user_keywords:
        - technical
    next_step_id: technical_support
  - condition:
      default: true
    next_step_id: general_support
```

---

## 3. Example Flows

To illustrate how to utilize the YAML specification effectively, let's explore several example flows, each demonstrating different aspects of the spec.

### 3.1. Basic Greeting Flow

**Objective:** Create a simple flow where the chatbot responds with a predefined greeting message and ends the conversation.

**Flow ID:** `greeting_flow`

**YAML Specification:**

```yaml
id: greeting_flow
trigger_keywords:
  - hello
  - hi
  - hey
steps:
  - id: start
    engine: basic
    bot: "Hello! How can I assist you today?"
    user_response_required: true
    branches:
      - condition:
          default: true
        next_step_id: end_conversation

  - id: end_conversation
    engine: basic
    bot: "Thank you for chatting with us! Have a great day."
    user_response_required: false
```

**Explanation:**

- **Trigger Keywords:** The flow is activated when the user sends messages containing "hello", "hi", or "hey".
- **Steps:**
  - **`start`:** Sends a greeting message and waits for user input.
  - **Branch:** Directs the conversation to `end_conversation` regardless of user input.
  - **`end_conversation`:** Sends a farewell message and ends the flow.

### 3.2. FAQ Flow

**Objective:** Create a flow that provides answers to frequently asked questions based on specific trigger keywords.

**Flow ID:** `faq_flow`

**YAML Specification:**

```yaml
id: faq_flow
trigger_keywords:
  - service
  - pricing
  - signup
  - password
  - privacy
steps:
  - id: start
    engine: basic
    bot: "Sure, I can help with that. Please specify your question related to service, pricing, signup, password, or privacy."
    user_response_required: true
    branches:
      - condition:
          expected_user_keywords:
            - service
        next_step_id: answer_service
      - condition:
          expected_user_keywords:
            - pricing
        next_step_id: answer_pricing
      - condition:
          expected_user_keywords:
            - signup
        next_step_id: answer_signup
      - condition:
          expected_user_keywords:
            - password
        next_step_id: answer_password
      - condition:
          expected_user_keywords:
            - privacy
        next_step_id: answer_privacy
      - condition:
          default: true
        next_step_id: not_found

  - id: answer_service
    engine: basic
    bot: "Our service connects you with qualified professionals who provide personalized mental health support tailored to your needs."
    user_response_required: false
    next_step_id: end_flow

  - id: answer_pricing
    engine: basic
    bot: "We offer various pricing plans to suit different needs, including monthly and yearly subscriptions. Visit our website for detailed information."
    user_response_required: false
    next_step_id: end_flow

  - id: answer_signup
    engine: basic
    bot: "To sign up, visit our homepage and click on the 'Sign Up' button. Follow the prompts to create your account easily."
    user_response_required: false
    next_step_id: end_flow

  - id: answer_password
    engine: basic
    bot: "You can reset your password by clicking on the 'Forgot Password' link on the login page and following the instructions sent to your email."
    user_response_required: false
    next_step_id: end_flow

  - id: answer_privacy
    engine: basic
    bot: "Your privacy is important to us. We adhere to strict data protection policies to ensure your information is secure and used responsibly."
    user_response_required: false
    next_step_id: end_flow

  - id: not_found
    engine: basic
    bot: "I'm sorry, I couldn't find an answer to that question. Could you please rephrase or ask something else?"
    user_response_required: false
    next_step_id: end_flow

  - id: end_flow
    engine: basic
    bot: "Is there anything else I can assist you with?"
    user_response_required: false

  - id: end_conversation
    engine: basic
    bot: "Thank you for reaching out! Have a great day."
    user_response_required: false
```

**Explanation:**

- **Trigger Keywords:** The flow is activated when the user mentions "service", "pricing", "signup", "password", or "privacy".
- **Steps:**
  - **`start`:** Asks the user to specify their question related to the available topics.
  - **Branches:** Directs the flow to the appropriate answer step based on the user's input.
  - **Answer Steps:** Each provides a specific response related to the user's query.
  - **`not_found`:** Handles unrecognized queries with a fallback message.
  - **`end_flow` and `end_conversation`:** Wrap up the conversation.

### 3.3. Feedback Flow with Branch-Only Steps

**Objective:** Create a flow where certain steps act solely as branches without sending messages, enabling internal logic or state transitions.

**Flow ID:** `feedback_flow`

**YAML Specification:**

```yaml
id: feedback_flow
trigger_keywords:
  - feedback
  - suggestion
steps:
  - id: start
    engine: basic
    bot: "Thank you for wanting to provide feedback! How can we improve your experience?"
    user_response_required: true
    branches:
      - condition:
          expected_user_keywords:
            - positive
        next_step_id: handle_positive_feedback
      - condition:
          expected_user_keywords:
            - negative
        next_step_id: handle_negative_feedback
      - condition:
          default: true
        next_step_id: handle_general_feedback

  - id: handle_positive_feedback
    engine: branch  # Branch-only step; no bot message
    user_response_required: false
    next_step_id: thank_positive_feedback

  - id: thank_positive_feedback
    engine: basic
    bot: "We're glad you're happy with our service! Thank you for your positive feedback."
    user_response_required: false
    next_step_id: end_flow

  - id: handle_negative_feedback
    engine: branch  # Branch-only step; no bot message
    user_response_required: false
    next_step_id: apologize_negative_feedback

  - id: apologize_negative_feedback
    engine: basic
    bot: "We're sorry to hear that you're not satisfied. We'll work on improving our services."
    user_response_required: false
    next_step_id: end_flow

  - id: handle_general_feedback
    engine: branch  # Branch-only step; no bot message
    user_response_required: false
    next_step_id: thank_general_feedback

  - id: thank_general_feedback
    engine: basic
    bot: "Thank you for your feedback! We appreciate your input."
    user_response_required: false
    next_step_id: end_flow

  - id: end_flow
    engine: basic
    bot: "Is there anything else I can assist you with?"
    user_response_required: false

  - id: end_conversation
    engine: basic
    bot: "Thank you for your time! Have a great day."
    user_response_required: false
```

**Explanation:**

- **Trigger Keywords:** The flow is activated when the user mentions "feedback" or "suggestion".
- **Steps:**
  - **`start`:** Asks the user how the service can be improved.
  - **Branches:** Directs the flow based on whether the feedback is positive, negative, or general.
  - **Branch-Only Steps (`handle_positive_feedback`, `handle_negative_feedback`, `handle_general_feedback`):** Act solely as connectors to the respective thank-you or apology steps without sending any messages.
  - **Response Steps:** Send appropriate messages based on the type of feedback.
  - **`end_flow` and `end_conversation`:** Wrap up the conversation.

### 3.4. Conditional Branching Based on Keywords

**Objective:** Create a flow that branches the conversation based on specific keywords detected in the user's message.

**Flow ID:** `support_flow`

**YAML Specification:**

```yaml
id: support_flow
trigger_keywords:
  - help
  - support
steps:
  - id: start
    engine: basic
    bot: "I'm here to help! Are you experiencing a technical issue or a billing problem?"
    user_response_required: true
    branches:
      - condition:
          expected_user_keywords:
            - technical
        next_step_id: technical_support
      - condition:
          expected_user_keywords:
            - billing
        next_step_id: billing_support
      - condition:
          default: true
        next_step_id: general_support

  - id: technical_support
    engine: basic
    bot: "For technical support, please visit our [Technical Support Page](https://example.com/tech-support) or contact our support team directly."
    user_response_required: false
    next_step_id: end_flow

  - id: billing_support
    engine: basic
    bot: "For billing support, please reach out to our billing department at billing@example.com or call us at 1-800-123-4567."
    user_response_required: false
    next_step_id: end_flow

  - id: general_support
    engine: basic
    bot: "For general inquiries, feel free to ask your question, and I'll do my best to assist you."
    user_response_required: false
    next_step_id: end_flow

  - id: end_flow
    engine: basic
    bot: "Is there anything else I can assist you with?"
    user_response_required: false

  - id: end_conversation
    engine: basic
    bot: "Thank you for reaching out! Have a great day."
    user_response_required: false
```

**Explanation:**

- **Trigger Keywords:** The flow is activated when the user mentions "help" or "support".
- **Steps:**
  - **`start`:** Asks the user whether they're facing a technical or billing issue.
  - **Branches:** Directs the flow to `technical_support`, `billing_support`, or `general_support` based on the presence of specific keywords in the user's response.
  - **Support Steps:** Provide relevant support information.
  - **`end_flow` and `end_conversation`:** Wrap up the conversation.