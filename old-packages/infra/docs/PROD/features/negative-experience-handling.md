# Oishiiteru Negative Experience Handling System

## Current System

### User Interaction

1. Immediate Personal Impact

    - Users can report "Disappointed" or "No Longer a Favorite"
    - Restaurant immediately removed from personal Top 10 list

2. Ranking Adjustment

    - Restaurants below removed one move up
    - 11th ranked restaurant (if any) moves to 10th spot

3. Cooldown Period
    - 30-day cooldown period after removal
    - Prevents impulsive changes

### Global Impact

1. Global Ranking Impact

    - Each removal decreases restaurant's global score
    - Impact weighted based on previous position

2. Trend Analysis

    - System tracks patterns of removals
    - Frequent removals cause substantial drop in global ranking

3. Transparency
    - "Recently Dropped" section visible to other users

### Recovery and Redemption

1. Recovery Mechanism
    - Restaurants can regain position through new positive rankings
    - Users encouraged to revisit removed restaurants after a period

## Proposed Improvements

### Enhanced User Interaction

1. Gradual Decline Option

    - Allow users to lower a restaurant's ranking within Top 10

2. Reason for Removal

    - Implement feature for users to specify removal reason
    - Categories: food quality, service, price, etc.

3. Temporary vs. Permanent Removal

    - Differentiate between temporary and more permanent removals

4. Comparative Feedback
    - Ask users if they've found a better alternative when removing a restaurant

### Refined Global Impact

1. Negative Experience Threshold

    - Require multiple negative experiences for significant global ranking drop

2. User Credibility Weighting

    - Give more weight to feedback from users with consistent, reliable ranking history

3. Time Decay Factor
    - Diminish impact of removals on global rankings over time

### Enhanced Transparency and Feedback

1. Feedback Loop for Restaurants

    - Notify restaurants when frequently removed from Top 10 lists

2. Integration with Review System
    - Consider how removal system integrates with existing review/rating system

### Cultural and Regional Considerations

1. Cultural Adaptations
    - Ensure system accounts for cultural differences in perceiving/reporting negative experiences

### Technical Implementations

1. Algorithm Adjustments

    - Modify ranking algorithm to incorporate new factors (user credibility, time decay, etc.)

2. Database Schema Updates

    - Design schema to store detailed removal reasons, temporary vs. permanent flags

3. User Interface Enhancements

    - Develop UI for gradual decline, reason specification, and comparative feedback

4. Analytics Dashboard
    - Create dashboard for tracking removal trends and patterns

### Testing and Validation

1. A/B Testing

    - Test new features with subset of users before full rollout

2. User Surveys

    - Gather feedback on new system's effectiveness and user satisfaction

3. Data Analysis
    - Analyze impact of new system on ranking accuracy and user engagement

## Next Steps

1. Prioritize improvements based on potential impact and implementation complexity
2. Create detailed technical specifications for each new feature
3. Develop project timeline and resource allocation plan
4. Begin phased implementation, starting with highest priority items
