# In-App Notification System

A simple pet project demonstrating how to build a real-time in-app notification system using NestJS, WebSockets, and Prisma.

## Overview

This project showcases a complete notification system where users receive real-time updates when recipes are created. It demonstrates the core concepts of building in-app notifications, including:

- Creating and storing notifications
- Delivering notifications in real-time via WebSockets
- Tracking notification read/delivery status
- User notification preferences

## Features

- **User Authentication**: Signup and login with JWT tokens
- **Recipe Management**: Create, read, update, and delete recipes
- **Real-Time Notifications**: Instant notifications delivered via WebSocket connections
- **Notification Preferences**: Users can opt-in to different notification types
- **Delivery Tracking**: Track whether notifications have been read and delivered
- **Pending Notifications**: Automatically deliver missed notifications when users reconnect

## How It Works

### 1. User Signs Up
When a user signs up, they automatically receive a welcome notification.

### 2. Recipe Creation Triggers Notifications
When someone creates a new recipe, the system:
1. Creates the recipe in the database
2. Creates a notification about the new recipe
3. Links the notification to all users who are subscribed to "recipe created" notifications
4. Immediately delivers the notification to users who are currently online via WebSocket

### 3. Real-Time Delivery
Users connected via WebSocket receive notifications instantly through personal rooms. Each user has their own room (`user:{userId}`) for targeted notification delivery.

### 4. Offline Users Get Notifications Later
If a user is offline when a notification is created, it's stored in the database. When they reconnect, all pending notifications are automatically delivered.

## Tech Stack

- **NestJS**: Backend framework
- **Prisma**: Database ORM
- **Socket.io**: WebSocket implementation for real-time communication
- **PostgreSQL**: Database
- **JWT**: Authentication
- **bcrypt**: Password hashing

## Database Schema

The project uses four main models:

- **User**: Stores user credentials and preferences
- **Recipe**: Stores recipe information
- **Notification**: Stores notification content
- **UserNotification**: Junction table linking users to notifications with read/delivery status
- **NotificationPrefrence**: Stores user notification preferences

## Authentication Flow

1. User connects to WebSocket with JWT token in the authorization header
2. Token is verified on connection
3. User joins their personal notification room
4. Any pending notifications are delivered immediately

## Key Components

### NotificationService
Handles all notification CRUD operations, including creating notifications, marking them as read/delivered, and retrieving notification lists.

### NotificationGateway
Manages WebSocket connections and real-time notification delivery. Authenticates users, manages personal rooms, and broadcasts notifications.

### RecipeService
Manages recipe operations and triggers notification creation when new recipes are added.

## Notification Types

- `RECIPE_CREATED_NOT`: Sent when a new recipe is created
- `RECIPE_UPDATED_NOT`: Reserved for recipe updates
- `RECIPE_DELETED_NOT`: Reserved for recipe deletions
- `WELCOME_NOT`: Sent when a user signs up

## What You'll Learn

This project demonstrates:

- Building a WebSocket gateway with authentication
- Creating a notification system with delivery tracking
- Managing real-time connections with Socket.io
- Using Prisma transactions for atomic operations
- Implementing user preferences for notifications
- Handling online/offline notification scenarios

## Contributing

This is a learning project, but feel free to fork and experiment with your own notification features!

---
