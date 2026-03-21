import {
  Section,
  SectionInner,
  SectionTitle,
  SectionSubtitle,
  StepsGrid,
  StepCard,
  StepNumber,
  StepTitle,
  StepDescription,
} from './styles';

const STEPS = [
  {
    title: 'Crie sua conta',
    description: 'Cadastro rápido com o nome da sua empresa. Em segundos você já tem acesso ao sistema.',
  },
  {
    title: 'Configure seus serviços',
    description: 'Adicione os serviços que oferece, defina categorias, itens e preços base.',
  },
  {
    title: 'Gere orçamentos',
    description: 'Monte orçamentos personalizados e envie PDFs profissionais aos seus clientes.',
  },
];

export function StepsSection() {
  return (
    <Section $dark>
      <SectionInner>
        <SectionTitle>
          Como <span>funciona</span>
        </SectionTitle>
        <SectionSubtitle>
          Três passos simples para começar a enviar orçamentos profissionais.
        </SectionSubtitle>
        <StepsGrid>
          {STEPS.map((step, index) => (
            <StepCard key={step.title}>
              <StepNumber>{index + 1}</StepNumber>
              <StepTitle>{step.title}</StepTitle>
              <StepDescription>{step.description}</StepDescription>
            </StepCard>
          ))}
        </StepsGrid>
      </SectionInner>
    </Section>
  );
}
