import { ArrowBackRounded, ArrowForwardRounded, PlayArrowRounded } from "@mui/icons-material";
import { Box, Typography } from "@mui/material";
import { useNavigate, useRouter } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  BackAction,
  CardFan,
  EditorialDeck,
  EditorialHeading,
  EditorialIntro,
  EditorialMain,
  EditorialNumber,
  EditorialSection,
  EditorialSectionBody,
  EditorialSectionTitle,
  Eyebrow,
  FaqAnswer,
  FaqHeading,
  FaqItemRoot,
  FaqList,
  FaqQuestion,
  FaqSection,
  FeatureSection,
  FinalCta,
  FinalCtaTitle,
  HeroActions,
  HeroCardImage,
  HeroCopy,
  HeroGrid,
  HeroIndex,
  HeroLead,
  HeroSeal,
  HeroSection,
  HeroTexture,
  HeroTitle,
  HeroTopline,
  HeroVisual,
  HeroVisualCaption,
  HomeDiscoveryInner,
  HomeDiscoveryLead,
  HomeDiscoveryLink,
  HomeDiscoveryLinks,
  HomeDiscoveryRoot,
  HomeDiscoveryTitle,
  NavigationInner,
  NavigationLabel,
  NavigationLink,
  NavigationLinks,
  NavigationSection,
  PrimaryAction,
  SecondaryAction,
  SeoContentWidth,
  SeoPageRoot,
} from "./SeoLandingPage.styles";

export type SeoPageLink = {
  label: string;
  to: string;
};

export type SeoEditorialSection = {
  title: string;
  body: string;
};

export type SeoFaqItem = {
  question: string;
  answer: string;
};

export type SeoLandingPageCopy = {
  backLabel: string;
  primaryActionLabel: string;
  heroVisualCaption: string;
  navigationLabel: string;
  editorialEyebrow: string;
  faqEyebrow: string;
  faqHeading: string;
  finalEyebrow: string;
  finalTitle: string;
  finalActionLabel: string;
};

const spanishSeoLandingCopy: SeoLandingPageCopy = {
  backLabel: "Volver",
  primaryActionLabel: "Entrar a jugar",
  heroVisualCaption: "2 · 4 · 6 jugadores / web",
  navigationLabel: "Seguí explorando",
  editorialEyebrow: "La mesa, sin misterio",
  faqEyebrow: "Antes de repartir",
  faqHeading: "Preguntas rápidas.",
  finalEyebrow: "La mesa está lista",
  finalTitle: "Tres cartas. Una decisión. Jugá ahora.",
  finalActionLabel: "Ir a las mesas",
};

type SeoLandingPageProps = {
  indexLabel: string;
  eyebrow: string;
  title: string;
  intro: string;
  editorialTitle: string;
  links: readonly SeoPageLink[];
  sections: readonly SeoEditorialSection[];
  heroCards: readonly [string, string, string];
  children?: ReactNode;
  faqs?: SeoFaqItem[];
  copy?: Partial<SeoLandingPageCopy>;
};

const heroCardPositions = ["left", "center", "right"] as const;

export function SeoLandingPage({
  indexLabel,
  eyebrow,
  title,
  intro,
  editorialTitle,
  links,
  sections,
  heroCards,
  children,
  faqs,
  copy,
}: SeoLandingPageProps) {
  const navigate = useNavigate();
  const router = useRouter();
  const secondaryLink = links[0];
  const pageCopy = { ...spanishSeoLandingCopy, ...copy };

  return (
    <SeoPageRoot>
      <HeroSection>
        <HeroTexture aria-hidden="true" />
        <SeoContentWidth>
          <HeroTopline>
            <BackAction
              startIcon={<ArrowBackRounded />}
              onClick={() => {
                if (router.history.canGoBack()) {
                  router.history.back();
                  return;
                }

                void navigate({ to: "/" });
              }}
            >
              {pageCopy.backLabel}
            </BackAction>
            <HeroIndex>{indexLabel}</HeroIndex>
          </HeroTopline>

          <HeroGrid>
            <HeroCopy>
              <Eyebrow>{eyebrow}</Eyebrow>
              <HeroTitle>{title}</HeroTitle>
              <HeroLead>{intro}</HeroLead>
              <HeroActions>
                <PrimaryAction to="/">
                  <PlayArrowRounded />
                  {pageCopy.primaryActionLabel}
                </PrimaryAction>
                {secondaryLink ? (
                  <SecondaryAction to={secondaryLink.to}>
                    {secondaryLink.label}
                    <ArrowForwardRounded />
                  </SecondaryAction>
                ) : null}
              </HeroActions>
            </HeroCopy>

            <HeroVisual aria-hidden="true">
              <CardFan>
                {heroCards.map((src, index) => (
                  <HeroCardImage
                    alt=""
                    data-card-position={heroCardPositions[index]}
                    key={src}
                    src={src}
                  />
                ))}
                <HeroSeal>
                  <img alt="" src="/trucoshi-logo.png" />
                </HeroSeal>
              </CardFan>
              <HeroVisualCaption>{pageCopy.heroVisualCaption}</HeroVisualCaption>
            </HeroVisual>
          </HeroGrid>
        </SeoContentWidth>
      </HeroSection>

      <NavigationSection aria-label="Explorar el Truco">
        <NavigationInner>
          <NavigationLabel>{pageCopy.navigationLabel}</NavigationLabel>
          <NavigationLinks>
            {links.map((link) => (
              <NavigationLink key={link.to} to={link.to}>
                {link.label}
                <ArrowForwardRounded className="seo-link-icon" />
              </NavigationLink>
            ))}
          </NavigationLinks>
        </NavigationInner>
      </NavigationSection>

      <EditorialMain>
        <SeoContentWidth>
          <EditorialIntro>
            <Eyebrow>{pageCopy.editorialEyebrow}</Eyebrow>
            <EditorialHeading>{editorialTitle}</EditorialHeading>
          </EditorialIntro>

          <EditorialDeck>
            {sections.map((section, index) => (
              <EditorialSection key={section.title}>
                <EditorialNumber>{String(index + 1).padStart(2, "0")}</EditorialNumber>
                <EditorialSectionTitle>{section.title}</EditorialSectionTitle>
                <EditorialSectionBody>{section.body}</EditorialSectionBody>
              </EditorialSection>
            ))}
          </EditorialDeck>

          {children ? <FeatureSection>{children}</FeatureSection> : null}

          {faqs?.length ? (
            <FaqSection>
              <Box>
                <Eyebrow>{pageCopy.faqEyebrow}</Eyebrow>
                <FaqHeading>{pageCopy.faqHeading}</FaqHeading>
              </Box>
              <FaqList>
                {faqs.map((faq, index) => (
                  <FaqItemRoot key={faq.question} open={index === 0 ? true : undefined}>
                    <FaqQuestion>{faq.question}</FaqQuestion>
                    <FaqAnswer>{faq.answer}</FaqAnswer>
                  </FaqItemRoot>
                ))}
              </FaqList>
            </FaqSection>
          ) : null}

          <FinalCta>
            <Box>
              <Typography
                color="inherit"
                fontSize="0.7rem"
                fontWeight={850}
                letterSpacing="0.14em"
                textTransform="uppercase"
              >
                {pageCopy.finalEyebrow}
              </Typography>
              <FinalCtaTitle>{pageCopy.finalTitle}</FinalCtaTitle>
            </Box>
            <PrimaryAction to="/">
              {pageCopy.finalActionLabel}
              <ArrowForwardRounded />
            </PrimaryAction>
          </FinalCta>
        </SeoContentWidth>
      </EditorialMain>
    </SeoPageRoot>
  );
}

const homeLinks: SeoPageLink[] = [
  { label: "Truco online", to: "/truco-online" },
  { label: "Truco argentino", to: "/truco-argentino" },
  { label: "Reglas del Truco", to: "/reglas-del-truco" },
  { label: "Ranking de cartas", to: "/ranking-cartas-truco" },
];

export function HomeSeoDiscovery() {
  return (
    <HomeDiscoveryRoot>
      <HomeDiscoveryInner>
        <Box>
          <Eyebrow>Conocé la mesa</Eyebrow>
          <HomeDiscoveryTitle>Truco online gratis, con mesa propia.</HomeDiscoveryTitle>
          <HomeDiscoveryLead>
            Partidas rápidas desde el navegador, con bots para practicar y las reglas siempre a
            mano.
          </HomeDiscoveryLead>
        </Box>

        <HomeDiscoveryLinks aria-label="Más sobre Trucoshi">
          {homeLinks.map((link) => (
            <HomeDiscoveryLink key={link.to} to={link.to}>
              {link.label}
              <ArrowForwardRounded className="seo-link-icon" />
            </HomeDiscoveryLink>
          ))}
        </HomeDiscoveryLinks>
      </HomeDiscoveryInner>
    </HomeDiscoveryRoot>
  );
}
