# NetWorthTracker Coding Standards

## General Principles

1. **SOLID Principles**
   - Single Responsibility: Each class/module should have one reason to change
   - Open/Closed: Open for extension, closed for modification
   - Liskov Substitution: Subtypes should be substitutable for their base types
   - Interface Segregation: Clients should not depend on interfaces they don't use
   - Dependency Inversion: High-level modules should not depend on low-level modules

2. **DRY (Don't Repeat Yourself)**
   - Avoid code duplication
   - Extract common functionality into reusable functions/classes
   - Use inheritance and composition appropriately

3. **KISS (Keep It Simple, Stupid)**
   - Prefer simple solutions over complex ones
   - Avoid premature optimization
   - Write code that is easy to understand and maintain

## Code Style

### JavaScript

1. **File Organization**
   - One class per file
   - Use ES6 modules (import/export)
   - Group related functionality in modules
   - Keep files under 300 lines when possible

2. **Naming Conventions**
   - Use camelCase for variables and functions
   - Use PascalCase for classes
   - Use UPPER_CASE for constants
   - Use descriptive, meaningful names
   - Prefix boolean variables with 'is', 'has', 'should', etc.

3. **Functions**
   - Keep functions small and focused
   - Use arrow functions for callbacks
   - Use default parameters when appropriate
   - Return early to avoid deep nesting
   - Document complex functions with JSDoc

4. **Classes**
   - Use constructor for initialization
   - Keep methods focused and small
   - Use private fields/methods when appropriate
   - Implement proper error handling
   - Document public methods with JSDoc

### HTML

1. **Structure**
   - Use semantic HTML5 elements
   - Maintain proper heading hierarchy
   - Use appropriate ARIA attributes
   - Keep markup clean and minimal

2. **Accessibility**
   - Ensure proper contrast ratios
   - Provide alt text for images
   - Use proper form labels
   - Support keyboard navigation

### CSS

1. **Organization**
   - Use BEM naming convention
   - Group related styles together
   - Use CSS variables for common values
   - Keep specificity low

2. **Responsive Design**
   - Mobile-first approach
   - Use relative units (rem, em)
   - Test on multiple devices
   - Use media queries appropriately

## Testing

1. **Unit Tests**
   - Write tests for all new functionality
   - Use descriptive test names
   - Follow AAA pattern (Arrange, Act, Assert)
   - Mock external dependencies
   - Aim for high test coverage

2. **Integration Tests**
   - Test component interactions
   - Test data flow
   - Test error scenarios
   - Test edge cases

## Documentation

1. **Code Comments**
   - Comment complex logic
   - Use JSDoc for functions and classes
   - Keep comments up to date
   - Remove commented-out code

2. **README**
   - Keep project description up to date
   - Document setup instructions
   - List dependencies
   - Provide usage examples