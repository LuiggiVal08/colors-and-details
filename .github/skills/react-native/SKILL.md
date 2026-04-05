---
name: react-native
description: '**WORKFLOW SKILL** — Implement new features in React Native apps using Expo Router, Zustand, TanStack Query, and modular architecture. USE FOR: adding screens, components, navigation, API integration, state management in inventory/orders system. DO NOT USE FOR: general coding; native modules; Expo setup.'
---

# React Native Development Skill

## Overview

This skill guides through the process of implementing new features in a React Native application using Expo Router for navigation, Zustand for state management, TanStack Query for API requests, and a modular architecture focused on inventory and orders systems.

## Workflow Steps

### 1. Requirements Analysis

- Review feature requirements and user stories
- Examine design mockups and specifications
- Identify dependencies and prerequisites
- Assess impact on existing modular architecture

### 2. Planning and Design

- Break down feature into smaller, modular tasks
- Design component hierarchy with reusable, short components
- Plan Expo Router structure and route parameters
- Identify Zustand stores and TanStack Query hooks needed

### 3. Implementation

- Set up Expo Router routes with proper typing for parameters
- Create modular components (keep files short, focused)
- Implement Zustand stores for state management
- Add TanStack Query hooks for API integration with rigorous error handling
- Style components using NativeWind

### 4. Testing and Validation

- Test on iOS and Android simulators/emulators
- Verify functionality across different screen sizes
- Check accessibility compliance
- Perform manual testing of edge cases, especially API error scenarios

### 5. Code Review and Optimization

- Ensure code follows project conventions and modular principles
- Optimize performance (avoid unnecessary renders, optimize images)
- Add proper error handling in TanStack Query
- Update documentation if needed

## Quality Criteria

- Code is well-documented with comments
- Follows TypeScript best practices, including route parameter typing
- Uses meaningful variable and function names
- Implements rigorous error handling with TanStack Query (loading states, error states, retry logic)
- Components are modular and files are not overly long
- Passes linting and type checking
- Works on both platforms
- Uses Zustand for all state management
- Uses TanStack Query for all API requests

## Tools and Dependencies

- Expo Router for navigation
- TypeScript for type safety
- Zustand for state management
- TanStack Query for API requests
- NativeWind for styling

## Common Patterns

- Use functional components with hooks
- Implement proper prop types and route parameter types
- Follow atomic design for modular components
- Use custom hooks for Zustand and TanStack Query logic
- Keep component files short by extracting sub-components

## Troubleshooting

- Check Metro bundler logs for build errors
- Verify Expo Router configuration
- Ensure Zustand stores are properly initialized
- Check TanStack Query error handling
- Clear cache if issues persist
