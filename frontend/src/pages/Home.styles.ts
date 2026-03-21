import styled from 'styled-components';

export const Page = styled.div`
  min-height: 100vh;
  background: var(--secondary);
  color: #fff;
  overflow-x: hidden;
`;

export const Nav = styled.nav<{ $scrolled: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 32px;
  transition: background 0.3s, box-shadow 0.3s;
  background: ${({ $scrolled }) => $scrolled ? 'var(--secondary)' : 'transparent'};
  box-shadow: ${({ $scrolled }) => $scrolled ? '0 2px 12px rgba(0,0,0,0.3)' : 'none'};

  @media (max-width: 768px) {
    padding: 12px 16px;
  }
`;

export const NavLogo = styled.span`
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary);
`;

export const NavButtons = styled.div`
  display: flex;
  gap: 12px;
`;

export const NavButton = styled.button<{ $primary?: boolean }>`
  padding: 8px 20px;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: ${({ $primary }) => $primary ? 'none' : '1px solid rgba(255,255,255,0.3)'};
  background: ${({ $primary }) => $primary ? 'var(--primary)' : 'transparent'};
  color: #fff;

  &:hover {
    background: ${({ $primary }) => $primary ? 'var(--primary-dark)' : 'rgba(255,255,255,0.1)'};
  }
`;

export const Hero = styled.section`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 100px 24px 80px;
  background: linear-gradient(135deg, var(--secondary) 0%, var(--secondary-light) 100%);
`;

export const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  line-height: 1.15;
  margin-bottom: 24px;
  max-width: 700px;

  span {
    color: var(--primary);
  }

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }

  @media (max-width: 480px) {
    font-size: 1.8rem;
  }
`;

export const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  max-width: 560px;
  line-height: 1.7;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

export const HeroButtons = styled.div`
  display: flex;
  gap: 16px;

  @media (max-width: 480px) {
    flex-direction: column;
    width: 100%;
    max-width: 300px;
  }
`;

export const PrimaryButton = styled.button`
  background: var(--primary);
  color: #fff;
  padding: 14px 36px;
  border: none;
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, transform 0.2s;

  &:hover {
    background: var(--primary-dark);
    transform: translateY(-2px);
  }
`;

export const SecondaryButton = styled.button`
  background: transparent;
  color: #fff;
  padding: 14px 36px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 8px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.6);
  }
`;

export const Section = styled.section<{ $dark?: boolean }>`
  padding: 80px 24px;
  background: ${({ $dark }) => $dark ? 'var(--secondary)' : 'var(--secondary-light)'};

  @media (max-width: 768px) {
    padding: 60px 16px;
  }
`;

export const SectionInner = styled.div`
  max-width: 1100px;
  margin: 0 auto;
`;

export const SectionTitle = styled.h2`
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 12px;

  span {
    color: var(--primary);
  }

  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
`;

export const SectionSubtitle = styled.p`
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.05rem;
  max-width: 600px;
  margin: 0 auto 48px;
  line-height: 1.6;
`;

export const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const FeatureCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 32px;
  transition: transform 0.2s, background 0.2s;

  &:hover {
    transform: translateY(-4px);
    background: rgba(255, 255, 255, 0.08);
  }
`;

export const FeatureIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 16px;
`;

export const FeatureTitle = styled.h3`
  font-size: 1.15rem;
  font-weight: 600;
  margin-bottom: 8px;
`;

export const FeatureDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.95rem;
  line-height: 1.6;
`;

export const StepsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

export const StepCard = styled.div`
  text-align: center;
  padding: 24px;
`;

export const StepNumber = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: var(--primary);
  color: #fff;
  font-size: 1.25rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
`;

export const StepTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
`;

export const StepDescription = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  line-height: 1.5;
`;

export const BenefitsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const BenefitItem = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 20px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
`;

export const BenefitIcon = styled.div`
  font-size: 1.5rem;
  flex-shrink: 0;
  margin-top: 2px;
`;

export const BenefitContent = styled.div``;

export const BenefitTitle = styled.h4`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 4px;
`;

export const BenefitDescription = styled.p`
  color: rgba(255, 255, 255, 0.65);
  font-size: 0.9rem;
  line-height: 1.5;
`;

export const CTASection = styled.section`
  padding: 80px 24px;
  text-align: center;
  background: linear-gradient(135deg, var(--secondary-light) 0%, var(--secondary) 100%);

  @media (max-width: 768px) {
    padding: 60px 16px;
  }
`;

export const CTATitle = styled.h2`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    font-size: 1.6rem;
  }
`;

export const CTASubtitle = styled.p`
  color: rgba(255, 255, 255, 0.75);
  font-size: 1.05rem;
  margin-bottom: 32px;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`;

export const Footer = styled.footer`
  padding: 32px 24px;
  text-align: center;
  background: var(--secondary);
  border-top: 1px solid rgba(255, 255, 255, 0.06);
`;

export const FooterText = styled.p`
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.85rem;
  margin-bottom: 8px;
`;

export const FooterLinks = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;

  button {
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.85rem;
    cursor: pointer;
    padding: 0;

    &:hover {
      color: var(--primary);
    }
  }
`;
