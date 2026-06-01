#!/bin/bash
# Convert framer-motion to CSS-first in all remaining files

FILES=(
  "src/components/landing/Pricing.tsx"
  "src/components/landing/HowItWorks.tsx"
  "src/components/landing/FAQ.tsx"
  "src/components/landing/Features.tsx"
  "src/components/landing/SocialProof.tsx"
  "src/app/page.tsx"
  "src/app/pricing/PricingClient.tsx"
  "src/app/signals/SignalsContent.tsx"
  "src/app/about/AboutContent.tsx"
  "src/app/features/FeaturesContent.tsx"
  "src/app/login/page.tsx"
  "src/app/signup/page.tsx"
  "src/app/profile/ProfileClient.tsx"
  "src/app/payment/success/page.tsx"
  "src/app/dashboard/page.tsx"
  "src/app/admin/dashboard/page.tsx"
  "src/components/dashboard/AlphaFeed.tsx"
  "src/components/dashboard/SignalDetail.tsx"
  "src/components/layout/Header.tsx"
  "src/components/PaymentButton.tsx"
  "src/components/error/ErrorBoundary.tsx"
  "src/components/animations/FloatingElements.tsx"
  "src/components/ui/Skeleton.tsx"
)

for f in "${FILES[@]}"; do
  if [ -f "$f" ]; then
    echo "Processing $f"
    
    # Replace imports
    sed -i "s/import { motion } from 'framer-motion'//g" "$f"
    sed -i "s/import { motion, AnimatePresence } from 'framer-motion'//g" "$f"
    sed -i "s/import { AnimatePresence } from 'framer-motion'//g" "$f"
    
    # Replace motion components with regular HTML
    sed -i 's/<motion\.div\([^>]*\)>/<div\1>/g' "$f"
    sed -i 's/<\/motion\.div>/<\/div>/g' "$f"
    sed -i 's/<motion\.button\([^>]*\)>/<button\1>/g' "$f"
    sed -i 's/<\/motion\.button>/<\/button>/g' "$f"
    sed -i 's/<motion\.a\([^>]*\)>/<a\1>/g' "$f"
    sed -i 's/<\/motion\.a>/<\/a>/g' "$f"
    sed -i 's/<motion\.span\([^>]*\)>/<span\1>/g' "$f"
    sed -i 's/<\/motion\.span>/<\/span>/g' "$f"
    sed -i 's/<motion\.section\([^>]*\)>/<section\1>/g' "$f"
    sed -i 's/<\/motion\.section>/<\/section>/g' "$f"
    sed -i 's/<motion\.header\([^>]*\)>/<header\1>/g' "$f"
    sed -i 's/<\/motion\.header>/<\/header>/g' "$f"
    sed -i 's/<motion\.img\([^>]*\)>/<img\1>/g' "$f"
    sed -i 's/<motion\.p\([^>]*\)>/<p\1>/g' "$f"
    sed -i 's/<\/motion\.p>/<\/p>/g' "$f"
    sed -i 's/<motion\.aside\([^>]*\)>/<aside\1>/g' "$f"
    sed -i 's/<\/motion\.aside>/<\/aside>/g' "$f"
    
    # Remove framer-motion specific props (these may leave trailing braces)
    sed -i 's/ whileHover={[^}]*}//g' "$f"
    sed -i 's/ whileTap={[^}]*}//g' "$f"
    sed -i 's/ initial={{[^}]*}}//g' "$f"
    sed -i 's/ animate={{[^}]*}}//g' "$f"
    sed -i 's/ transition={{[^}]*}}//g' "$f"
    sed -i 's/ viewport={{[^}]*}}//g' "$f"
    sed -i 's/ layoutId="[^"]*"//g' "$f"
    sed -i 's/ variants={{[^}]*}}//g' "$f"
    sed -i 's/ exit={{[^}]*}}//g' "$f"
    sed -i 's/ key="[^"]*"//g' "$f"
    
    # Remove blank lines that result from import removal
    sed -i '/^$/N;/^\n$/D' "$f"
    
    # Clean up empty lines
    sed -i '/^\.\.\.$/d' "$f"
  fi
done

echo "Done processing all files"
