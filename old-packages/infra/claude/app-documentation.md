# Oishiiteru: Dynamic Food Discovery and Ranking Platform

## Table of Contents

1. [Introduction](#introduction)
2. [Core Features](#core-features)
3. [Technical Stack](#technical-stack)
4. [Data Models](#data-models)
5. [Key Components](#key-components)
6. [User Experience (UX) Design](#user-experience-ux-design)
7. [Ranking and Scoring System](#ranking-and-scoring-system)
8. [Performance Optimization](#performance-optimization)
9. [Security Measures](#security-measures)
10. [Testing Strategy](#testing-strategy)
11. [Deployment Process](#deployment-process)
12. [Monitoring and Analytics](#monitoring-and-analytics)
13. [Localization and Internationalization](#localization-and-internationalization)
14. [Future Enhancements](#future-enhancements)
15. [Conclusion](#conclusion)

## 1. Introduction

Oishiiteru is a revolutionary food discovery and social platform that challenges the status quo of traditional review systems. At its core is a transformative vision:

> "Unlike traditional review platforms that rely on static star ratings, Oishiiteru embraces the idea that taste is subjective and ever-evolving, allowing users to easily update their rankings as they discover new favorites."

This philosophy drives every aspect of Oishiiteru, creating a dynamic ecosystem where personal preferences reign supreme and the joy of culinary discovery is constantly celebrated.

### 1.1 Core Concepts

- Dynamic Ranking System
- Evolving Preferences
- Collective Wisdom
- Social Sharing
- Restaurant Engagement
- Gamification
- Mobile Vendor Support
- Frequency-based Scoring
- Local Favorites Discovery
- Hidden Gems Surfacing

### 1.2 Target Audience

- Food enthusiasts
- Casual diners
- Tourists
- Restaurants and food vendors
- Food bloggers and influencers
- Social media users
- Mobile food vendors and pop-up restaurants

## 2. Core Features

### 2.1 Personalized Ranking System (Primary Feature)

- Unique mechanism based on user-created top 10 lists, not traditional star ratings
- Real-time aggregation of user rankings to determine best food options
- Easy-to-use interface for creating and updating personal rankings

Ranking Mechanism:

1. Users create and update their top 10 lists for various food categories (e.g., Nasi Lemak, Char Kuey Teow).
2. Each position in a user's list is assigned a score (e.g., #1 = 10 points, #2 = 9 points, etc.).
3. The system aggregates these scores across all users for each restaurant or dish.
4. Restaurants or dishes with the highest total scores appear at the top of search results.

Example: When searching for the best Nasi Lemak:

- 'Nasi Lemak Antarabangsa' ranked #1 by 10 users (10 points each) = 100 points
- 'Nasi Lemak Royale' ranked #2 by 15 users (9 points each) = 135 points
- 'Nasi Lemak Antarabangsa' appears higher in results due to more top rankings, despite fewer total votes

This system ensures results reflect genuine user preferences, highlighting truly outstanding options.

### 2.2 Real-time Mobile Vendor Tracking (Primary Feature)

- Location tracking for food trucks, pop-ups, and temporary stalls
- Real-time updates of vendor locations
- Specialized search and filter options for mobile food vendors

Example: Users can locate their favorite Char Kuey Teow food truck in real-time, even as it moves to different locations throughout the day.

### 2.3 Community-Driven Discovery

- Aggregation of user rankings to showcase local favorites
- Personalized recommendations based on user preferences and community trends
- Social features for sharing discoveries and following other users

### 2.4 Advanced Search and Filters

- Multi-parameter search functionality
- Filters for cuisine type, price range, dietary restrictions, and more
- Integration of ranking and frequency data in search results
- Specialized filters for local and traditional cuisines

### 2.5 Gamification Elements

- Points system for active users
- Badges and achievements for discoveries and ranking activities
- Challenges and competitions to encourage exploration

### 2.6 Restaurant and Vendor Engagement

- Profiles for restaurants and mobile vendors to showcase menus and specialties
- Ability for vendors to update information, specials, and (for mobile vendors) locations
- Direct communication channel between vendors and users

### 2.7 Data-Driven Insights

- Trend analysis for popular dishes and cuisines
- Identification of up-and-coming restaurants and hidden gems
- Personalized activity feed showing friends' discoveries and rankings

### 2.8 User-Friendly Interface

- Intuitive design for easy ranking and discovery
- Seamless experience across desktop and mobile devices
- Accessibility features for users with diverse needs

## 3. Technical Stack

### 3.1 Frontend

- Next.js 14
- React 18
- NextUI v2
- Tailwind CSS

### 3.2 Backend

- AWS Amplify v6
- GraphQL API (AWS AppSync)
- AWS Lambda
- Amazon DynamoDB
- Amazon Elasticsearch Service

### 3.3 Authentication

- AWS Cognito

### 3.4 File Storage

- Amazon S3

### 3.5 Real-time Features

- AWS AppSync subscriptions
- Amazon ElastiCache (Redis)

### 3.6 CDN and Edge Computing

- Amazon CloudFront
- AWS Lambda@Edge

### 3.7 Analytics and Monitoring

- Amazon Pinpoint
- AWS CloudWatch
- AWS X-Ray

### 3.8 DevOps and CI/CD

- AWS Amplify Console
- GitHub Actions

### 3.9 AI and Machine Learning

- Amazon Personalize
- Amazon Rekognition

## 4. Data Models

### 4.1 User

- Personal information
- Preferences
- Rankings
- Visit history

### 4.2 Restaurant

- Basic information
- Menu
- Rankings
- Frequency score
- Visit data
- Neighborhood

### 4.3 Dish

- Information
- Associated restaurant
- Rankings

### 4.4 Ranking

- User reference
- Restaurant or dish reference
- Position

### 4.5 Visit

- User reference
- Restaurant reference
- Date

### 4.6 Review

- User reference
- Restaurant reference
- Content
- Rating

### 4.7 Post

- User reference
- Content
- Associated restaurant or dish (optional)

### 4.8 Challenge

- Description
- Participants
- Start and end dates

### 4.9 Achievement

- User reference
- Type
- Date earned

### 4.10 Notification

- User reference
- Content
- Type
- Read status

## 5. Key Components

### 5.1 RestaurantScore Component

- Displays combined ranking and frequency scores
- Visual representation of scores
- Textual description of restaurant standing

### 5.2 PersonalRankingList Component

- Interface for users to create and edit their top 10 lists
- Drag-and-drop functionality for easy reordering

### 5.3 LocalFavorites Component

- Displays top restaurants in a given neighborhood based on frequency scores
- Filterable by cuisine type and other parameters

### 5.4 HiddenGems Component

- Showcases restaurants with high frequency scores but lower ranking scores
- Encourages exploration of potentially underrated establishments

### 5.5 RecentlyVisitedFeed Component

- Displays a user's recent restaurant visits
- Provides quick access to revisit or rank recently visited restaurants

### 5.6 RestaurantProfile Component

- Comprehensive view of a restaurant including scores, rankings, and visit data
- Menu display and special features for restaurant owners

### 5.7 UserProfile Component

- Displays user's rankings, visit history, and achievements
- Social features for following and activity feeds

### 5.8 SearchAndFilter Component

- Advanced search functionality incorporating ranking and frequency data
- Multiple filter options for refined searches

### 5.9 MobileVendorMap Component

- Real-time map of mobile vendor locations
- Filters for cuisine type and user ratings

### 5.10 GamificationDashboard Component

- Displays user points, badges, and leaderboard positions
- Provides challenges and achievements for users to pursue

## 6. User Experience (UX) Design

### 6.1 Intuitive Ranking Interface

- Drag-and-drop functionality for creating and editing top 10 lists
- Real-time updates and smooth animations

### 6.2 Personalized Discovery Feed

- AI-driven recommendations based on user preferences and behavior
- Integration of social signals from followed users

### 6.3 Interactive Maps

- Location-based discovery of restaurants and mobile vendors
- Visual representation of local favorites and hidden gems

### 6.4 Gamification Elements

- Progress bars, badges, and animations for achievements
- Leaderboards and challenges to encourage engagement

### 6.5 Social Features

- Activity feeds showing friends' discoveries and rankings
- Easy sharing of lists and individual restaurant experiences

### 6.6 Responsive Design

- Seamless experience across desktop, tablet, and mobile devices
- Touch-friendly interfaces for mobile users

### 6.7 Accessibility Considerations

- High contrast modes and screen reader compatibility
- Keyboard navigation support

## 7. Ranking and Scoring System

### 7.1 Restaurant Score Calculation

```typescript
function calculateRestaurantScore(rankings: UserRanking[]): number {
    const userCount = rankings.length;
    const userWeight = Math.log(1 + userCount);

    const totalScore = rankings.reduce((sum, ranking) => {
        const rankingPoints = Math.max(11 - ranking.position, 0);
        return sum + rankingPoints * userWeight;
    }, 0);

    const totalPossiblePoints = 10 * userCount * userWeight;

    return (totalScore / totalPossiblePoints) * 10;
}
```

### 7.2 Frequency Score Calculation

```typescript
function calculateFrequencyScore(visits: Visit[], timeframe: number = 30): number {
    const now = new Date();
    const recentVisits = visits.filter(
        (visit) => (now.getTime() - visit.date.getTime()) / (1000 * 3600 * 24) <= timeframe
    );

    const uniqueVisitors = new Set(recentVisits.map((visit) => visit.userId)).size;
    const totalVisits = recentVisits.length;

    return Math.min((totalVisits / uniqueVisitors) * (uniqueVisitors / 20) * 10, 10);
}
```

### 7.3 Combined Score

- Equal weight given to ranking score and frequency score
- Provides a balanced view of popularity and regular patronage

### 7.4 Local Favorites Algorithm

```typescript
function getLocalFavorites(restaurants: Restaurant[], neighborhood: string): Restaurant[] {
    return restaurants
        .filter((restaurant) => restaurant.neighborhood === neighborhood)
        .sort((a, b) => b.frequencyScore - a.frequencyScore)
        .slice(0, 10);
}
```

### 7.5 Hidden Gems Algorithm

```typescript
function findHiddenGems(restaurants: Restaurant[]): Restaurant[] {
    return restaurants
        .filter((restaurant) => restaurant.frequencyScore > 7 && restaurant.rankingScore < 5)
        .sort((a, b) => b.frequencyScore - a.frequencyScore)
        .slice(0, 20);
}
```

## 8. Performance Optimization

### 8.1 Efficient Ranking Updates

- Optimized algorithms for updating global rankings
- Caching of intermediate results to reduce computation

### 8.2 Lazy Loading and Pagination

- Implementation in infinite scroll feeds
- Reduction of initial load times and data transfer

### 8.3 Image Optimization

- Automatic resizing and compression of uploaded images
- Lazy loading of images in feeds and lists

### 8.4 Caching Strategies

- Utilization of AWS CloudFront for static asset caching
- Implementation of application-level caching for frequently accessed data

### 8.5 Database Optimization

- Proper indexing of frequently queried fields
- Use of DynamoDB's global secondary indexes for complex queries

### 8.6 Server-Side Rendering (SSR)

- Implementation for initial page loads to improve SEO and performance
- Hybrid approach with client-side rendering for dynamic content

## 9. Security Measures

### 9.1 Authentication and Authorization

- Secure user authentication using AWS Cognito
- Role-based access control for different user types (regular users, restaurant owners, admins)

### 9.2 Data Encryption

- Encryption of data in transit using HTTPS
- Encryption of sensitive data at rest in DynamoDB

### 9.3 Input Validation and Sanitization

- Server-side validation of all user inputs
- Sanitization of user-generated content to prevent XSS attacks

### 9.4 Rate Limiting

- Implementation of rate limiting on API endpoints to prevent abuse
- Use of AWS WAF for additional protection against DDoS attacks

### 9.5 Regular Security Audits

- Scheduled security reviews and penetration testing
- Continuous monitoring for suspicious activities

### 9.6 Compliance

- Adherence to GDPR and CCPA regulations for user data protection
- Implementation of data portability and right to be forgotten features

## 10. Testing Strategy

### 10.1 Unit Testing

- Comprehensive unit tests for all utility functions and components
- Use of Jest for JavaScript/TypeScript testing

### 10.2 Integration Testing

- Testing of interactions between components and services
- Use of React Testing Library for component integration tests

### 10.3 End-to-End Testing

- Simulation of user journeys using Cypress
- Coverage of critical paths including ranking, searching, and social features

### 10.4 Performance Testing

- Load testing of APIs and database queries
- Frontend performance testing using Lighthouse

### 10.5 Security Testing

- Regular security scans and penetration testing
- Validation of authentication and authorization mechanisms

### 10.6 Accessibility Testing

- Automated accessibility checks using tools like axe-core
- Manual testing with screen readers and keyboard navigation

## 11. Deployment Process

### 11.1 Continuous Integration

- Automated builds and tests on every pull request using GitHub Actions

### 11.2 Staging Environment

- Deployment to a staging environment for final testing before production

### 11.3 Blue-Green Deployment

- Use of blue-green deployment strategy to minimize downtime
- Easy rollback in case of issues

### 11.4 Database Migrations

- Automated database schema migrations as part of the deployment process
- Versioning of database schemas

### 11.5 Monitoring and Alerting

- Setup of CloudWatch alarms for critical metrics
- Integration with PagerDuty for on-call notifications

## 12. Monitoring and Analytics

### 12.1 User Engagement Metrics

- Tracking of active users, session duration, and feature usage
- Analysis of ranking and visiting patterns

### 12.2 Performance Monitoring

- Real-time monitoring of API response times and error rates
- Frontend performance tracking including page load times and client-side errors

### 12.3 Business Metrics

- Monitoring of key business metrics such as new user signups and restaurant additions
- Tracking of premium feature usage and conversions

### 12.4 Custom Dashboards

- Creation of custom CloudWatch dashboards for different stakeholders
- Real-time visualization of critical application metrics

## 13. Localization and Internationalization

### 13.1 Multi-language Support

- Implementation of i18n framework for easy translation management
- Support for right-to-left (RTL) languages

### 13.2 Cultural Adaptations

- Customization of food categories and cuisines based on regions
- Adaptation of gamification elements to suit different cultural contexts

### 13.3 Local Search and Discovery

- Region-specific search algorithms and recommendations
- Integration with local mapping services where necessary

## 14. Future Enhancements

### 14.1 AI-Powered Recommendations

- Implementation of more sophisticated AI models for personalized recommendations
- Integration of computer vision for food image recognition and auto-tagging

### 14.2 Augmented Reality Features

- AR view for visualizing dishes in real-time
- Interactive AR maps for discovering nearby restaurants and dishes

### 14.3 Voice Interface

- Integration with voice assistants for hands-free restaurant discovery and ranking

### 14.4 Blockchain Integration

- Exploration of blockchain technology for verifiable review and ranking systems
- Potential for crypto rewards for active users and high-quality contributions

### 14.5 Advanced Analytics for Restaurants

- Provision of detailed analytics and insights for restaurant owners
- Predictive models for menu optimization and customer preferences

## 15. Conclusion

Oishiiteru aims to revolutionize the food discovery and sharing experience by embracing the dynamic nature of culinary preferences. By focusing on personalized, easily updatable rankings and leveraging collective user wisdom, it provides a unique and valuable service in the food discovery market. The integration of frequency-based scoring and local favorites discovery ensures a balanced view of both aspirational top picks and everyday favorites.

The emphasis on individual preferences, social features, and gamification, combined with the innovative approach to surfacing hidden gems and local favorites, sets Oishiiteru apart from traditional restaurant review platforms. This creates a vibrant ecosystem for food enthusiasts to explore, share, and celebrate their evolving tastes while also supporting local businesses and fostering community engagement.

As Oishiiteru continues to grow and evolve, it will remain committed to its core philosophy of dynamic, personalized food discovery,
