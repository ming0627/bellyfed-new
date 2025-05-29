import { Button } from '@/components/ui/button';
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Crown,
  Check,
  Sparkles,
  Star,
  Shield,
  Zap,
  Bot,
  Rocket,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
// Import cn utility function for class name merging
// This is a type-safe function to merge class names
const cn = (...classes: (string | boolean | undefined)[]): string => {
  return classes.filter(Boolean).join(' ');
};
import { GetStaticProps, GetStaticPaths } from 'next';
import { useCountry } from '@/contexts/CountryContext';

// Define supported countries and their currencies
interface CountryConfig {
  currency: string;
  symbol: string;
  prices: {
    personalPro: {
      monthly: number;
      yearly: number;
      student: number;
      family: number;
      standardVoucher: number;
    };
    elite: {
      monthly: number;
      yearly: number;
      standardVoucher: number;
      premiumVoucher: number;
    };
  };
}

const countryConfigs: Record<string, CountryConfig> = {
  sg: {
    currency: 'SGD',
    symbol: 'SGD',
    prices: {
      personalPro: {
        monthly: 12,
        yearly: 108,
        student: 8,
        family: 30,
        standardVoucher: 10,
      },
      elite: {
        monthly: 30,
        yearly: 240,
        standardVoucher: 10,
        premiumVoucher: 25,
      },
    },
  },
  my: {
    currency: 'MYR',
    symbol: 'RM',
    prices: {
      personalPro: {
        monthly: 20,
        yearly: 180,
        student: 13,
        family: 50,
        standardVoucher: 15,
      },
      elite: {
        monthly: 50,
        yearly: 400,
        standardVoucher: 15,
        premiumVoucher: 40,
      },
    },
  },
};

interface PricingProps {
  country: string;
  countryConfig: CountryConfig | null;
}

const formatPrice = (amount: number, config: CountryConfig): string => {
  return `${config.symbol}${amount}`;
};

const features = [
  {
    icon: Crown,
    title: 'Enhanced Discovery',
    description: 'Find the best dishes tailored to your taste preferences',
    tiers: ['personal-pro', 'elite'],
  },
  {
    icon: Star,
    title: 'Advanced Analytics',
    description: 'Gain insights into your dining habits and preferences',
    tiers: ['personal-pro', 'elite'],
  },
  {
    icon: Bot,
    title: 'AI Culinary Concierge',
    description: 'Get personalized recommendations and assistance',
    tiers: ['elite'],
  },
  {
    icon: Shield,
    title: 'Zero Sponsored Content',
    description: 'Enjoy an ad-free experience with unbiased recommendations',
    tiers: ['elite'],
  },
  {
    icon: Rocket,
    title: 'Social Features',
    description: 'Connect with friends and share your culinary experiences',
    tiers: ['personal-pro', 'elite'],
  },
  {
    icon: Zap,
    title: 'Dining Vouchers',
    description: 'Exclusive discounts at partner restaurants',
    tiers: ['personal-pro', 'elite'],
  },
];

// Define a type for plan objects
interface Plan {
  name: string;
  price: string;
  period: string;
  popular?: boolean;
  highlight?: boolean;
  description: string;
  features: string[];
  yearlyPrice?: string;
  savings?: string;
  specialOffers?: string[];
  voucherBenefits?: {
    premium?: {
      count: number;
      value: string;
    };
    standard?: {
      count: number;
      value: string;
    };
    validity?: string;
  };
}

const getPlans = (config: CountryConfig): Plan[] => {
  if (!config || !config.prices) {
    return [];
  }

  return [
    {
      name: 'Free',
      price: formatPrice(0, config),
      period: '/mo',
      popular: false,
      description: 'Basic features for casual users',
      features: [
        'Unlimited basic rankings & reviews',
        'Standard discovery feed',
        'Community access',
        'Basic analytics',
        'Custom lists',
        'Private groups',
        'Includes sponsored recommendations',
      ],
    },
    {
      name: 'Personal Pro',
      price: formatPrice(config.prices.personalPro.monthly, config),
      period: '/mo',
      yearlyPrice: `${formatPrice(config.prices.personalPro.yearly, config)}/year`,
      savings: 'Save 25%',
      popular: true,
      description: 'Enhanced features for food enthusiasts',
      specialOffers: [
        `Student: ${formatPrice(config.prices.personalPro.student, config)}/mo`,
        `Family (4 accounts): ${formatPrice(config.prices.personalPro.family, config)}/mo`,
        'Referral rewards available',
      ],
      features: [
        'All Free features',
        'AI-driven recommendations',
        'Detailed taste analytics',
        'Premium social tools',
        'Pro-level review utilities',
        'Priority support',
        `2 Standard Vouchers (${formatPrice(config.prices.personalPro.standardVoucher, config)} each)`,
        'Vouchers valid for 1 month',
      ],
    },
    {
      name: 'Elite',
      price: formatPrice(config.prices.elite.monthly, config),
      period: '/mo',
      yearlyPrice: `${formatPrice(config.prices.elite.yearly, config)}/year`,
      savings: 'Save 33%',
      highlight: true,
      description: 'Premium experience for culinary connoisseurs',
      voucherBenefits: {
        premium: {
          count: 2,
          value: formatPrice(config.prices.elite.premiumVoucher, config),
        },
        standard: {
          count: 4,
          value: formatPrice(config.prices.elite.standardVoucher, config),
        },
        validity: '1 month',
      },
      features: [
        'All Personal Pro features',
        'Zero sponsored content',
        '24/7 AI culinary concierge',
        'Voice-enabled assistance',
        `2 Premium Vouchers (${formatPrice(config.prices.elite.premiumVoucher, config)} each)`,
        `4 Standard Vouchers (${formatPrice(config.prices.elite.standardVoucher, config)} each)`,
        'Priority restaurant reservations',
        'Exclusive tasting events',
        'Special seasonal menus',
        'Personalized dining journey',
      ],
    },
  ];
};

interface FloatingElementProps {
  children: React.ReactNode;
  delay?: number;
}

const FloatingElement = ({ children, delay = 0 }: FloatingElementProps) => (
  <motion.div
    animate={{
      y: [0, -10, 0],
    }}
    transition={{
      duration: 4,
      repeat: Infinity,
      delay,
    }}
    className="will-change-transform"
  >
    {children}
  </motion.div>
);

interface PlanCardProps {
  plan: Plan;
}

const PlanCard = ({ plan }: PlanCardProps) => (
  <Card
    className={
      cn(
        'relative overflow-hidden group hover:shadow-xl transition-all duration-300',
        plan.highlight
          ? 'border-primary shadow-lg border-2'
          : 'hover:border-primary/50',
      ) as string
    }
  >
    {plan.popular && (
      <div className="absolute -right-12 top-6 bg-primary px-12 py-1 text-sm rotate-45 text-primary-foreground font-medium">
        Most Popular
      </div>
    )}
    <CardContent className="pt-6">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors duration-300">
          {plan.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
        <div className="flex items-center justify-center mb-2">
          <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            {plan.price}
          </span>
          <span className="text-muted-foreground ml-1">{plan.period}</span>
        </div>
        {plan.yearlyPrice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-2"
          >
            <div className="text-sm text-muted-foreground">
              {plan.yearlyPrice}
            </div>
            <div className="text-sm font-medium text-primary">
              {plan.savings}
            </div>
          </motion.div>
        )}
      </div>

      {plan.specialOffers && (
        <div className="mb-6 bg-secondary/5 rounded-lg p-4">
          <h4 className="text-sm font-semibold mb-3 text-center">
            Special Offers
          </h4>
          <ul className="space-y-2">
            {plan.specialOffers.map((offer, idx) => (
              <li
                key={idx}
                className="text-sm text-muted-foreground flex items-center"
              >
                <Sparkles className="w-4 h-4 mr-2 text-yellow-500" />
                {offer}
              </li>
            ))}
          </ul>
        </div>
      )}

      {plan.voucherBenefits &&
        plan.voucherBenefits.premium &&
        plan.voucherBenefits.standard && (
          <div className="mb-6 bg-primary/5 rounded-lg p-4">
            <h4 className="text-sm font-semibold mb-3 text-center">
              Monthly Vouchers
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Premium Vouchers</span>
                <span className="text-sm font-medium">
                  {plan.voucherBenefits.premium.count}×{' '}
                  {plan.voucherBenefits.premium.value}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Standard Vouchers</span>
                <span className="text-sm font-medium">
                  {plan.voucherBenefits.standard.count}×{' '}
                  {plan.voucherBenefits.standard.value}
                </span>
              </div>
              {plan.voucherBenefits.validity && (
                <div className="text-xs text-muted-foreground text-center mt-2">
                  Unused vouchers valid for {plan.voucherBenefits.validity}
                </div>
              )}
            </div>
          </div>
        )}

      <div className="space-y-4 min-h-[280px]">
        {plan.features.map((feature, featureIndex) => (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: featureIndex * 0.1 }}
            viewport={{ once: true }}
            key={featureIndex}
            className="flex items-start gap-3"
          >
            <div className="rounded-full p-1 bg-primary/10">
              <Check className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
              {feature}
            </span>
          </motion.div>
        ))}
      </div>

      <Button
        className={cn(
          'w-full mt-8 transition-all duration-300',
          plan.highlight
            ? 'bg-primary hover:bg-primary/90'
            : 'hover:bg-primary/10',
        )}
        variant={plan.highlight ? 'default' : 'outline'}
      >
        Get Started
      </Button>
    </CardContent>
  </Card>
);

const FeatureGrid = (): React.ReactElement => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16 mb-16">
      {features.map((feature, index) => (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          viewport={{ once: true }}
          key={feature.title}
        >
          <Card className="bg-card hover:shadow-lg transition-shadow duration-300 group">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="p-3 bg-primary/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                {feature.description}
              </p>
              <div className="mt-4 flex gap-2">
                {feature.tiers.includes('personal-pro') && (
                  <div className="text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-full font-medium">
                    Personal Pro
                  </div>
                )}
                {feature.tiers.includes('elite') && (
                  <div className="text-xs px-3 py-1.5 bg-secondary/10 text-secondary rounded-full font-medium">
                    Elite
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

const PremiumPage: React.FC<PricingProps> = ({ countryConfig, country }) => {
  const { setCountryByCode } = useCountry();

  // Update country context when page loads
  useEffect(() => {
    if (country) {
      setCountryByCode(country);
    }
  }, [country, setCountryByCode]); // Depend on country prop and setCountryByCode function

  const plans = React.useMemo(() => {
    if (!countryConfig) {
      return [];
    }
    return getPlans(countryConfig);
  }, [countryConfig]);

  if (!countryConfig || plans.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Country Not Supported</h1>
          <p>
            This service is currently only available in Singapore and Malaysia.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-background to-background/50"
      key={country}
    >
      <div className="container mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
            <span className="relative inline-block">
              Premium Experience
              <FloatingElement>
                <Crown className="absolute -top-8 -right-8 w-10 h-10 text-primary" />
              </FloatingElement>
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Elevate your culinary journey with exclusive features and premium
            benefits
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 mt-12">
          {plans.map((plan, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              viewport={{ once: true }}
              key={plan.name}
            >
              <PlanCard plan={plan} />
            </motion.div>
          ))}
        </div>

        <FeatureGrid />
      </div>
    </div>
  );
};

// Pre-render these paths
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [{ params: { country: 'my' } }, { params: { country: 'sg' } }],
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const country = (params?.country as string)?.toLowerCase();

  // Only allow 'sg' or 'my' as valid country codes
  if (!country || !['sg', 'my'].includes(country)) {
    return {
      notFound: true,
    };
  }

  const countryConfig = countryConfigs[country];

  if (countryConfig) {
    return {
      props: {
        country,
        countryConfig,
        key: country, // Add a key to force re-render only when country changes
      },
    };
  }

  return {
    notFound: true,
  };
};

export default PremiumPage;
