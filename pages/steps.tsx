import React from "react";

import Box from "@mui/material/Box";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { Container, StepContent } from "@mui/material";

const Page = () => {
  return (
    <Container>
      <HorizontalLinearStepper />
    </Container>
  );
};

export default Page;

type Step = { label: string; description: string; inner?: Step[] };
const steps: Step[] = [
  { label: "Page 1", description: "Page 1" },
  {
    label: "Map",
    description: "",
    inner: [
      { label: "General", description: "Page 2A" },
      { label: "Floor plan", description: "Page 2B" },
    ],
  },
  { label: "Page 3", description: "Page 3" },
];

function HorizontalLinearStepper() {
  const [parentActiveStep, setParentActiveStep] = React.useState(0);
  const [childActiveStep, setChildActiveStep] = React.useState(0);
  const [skipped, setSkipped] = React.useState(new Set<number>());

  const isStepOptional = (step: number) => {
    return step === 1;
  };

  const isStepSkipped = (step: number) => {
    return skipped.has(step);
  };

  const handleNext = () => {
    let newSkipped = skipped;

    if (isStepSkipped(parentActiveStep)) {
      newSkipped = new Set(newSkipped.values());
      newSkipped.delete(parentActiveStep);
    }

    const currentStep = steps[parentActiveStep];
    if (currentStep?.inner && childActiveStep < currentStep.inner.length - 1) {
      // If there are child steps, move to the next child step
      setChildActiveStep((prevActiveStep) => prevActiveStep + 1);
    } else if (currentStep?.inner && parentActiveStep === steps.length - 1) {
      // If current parent step has inner steps and is the last step, go to the first inner step
      setParentActiveStep(0);
      setChildActiveStep(0);
    } else if (currentStep?.inner) {
      // If current parent step has inner steps, go to the first inner step
      setParentActiveStep(parentActiveStep + 1);
      setChildActiveStep(0);
    } else {
      // Otherwise, go to the next step in the parent
      setParentActiveStep((prevActiveStep) => prevActiveStep + 1);
    }

    setSkipped(newSkipped);
  };

  const handleBack = () => {
    if (childActiveStep > 0) {
      // If there are child steps, move to the previous child step
      setChildActiveStep((prevActiveStep) => prevActiveStep - 1);
    } else if (parentActiveStep > 0 && steps[parentActiveStep - 1]?.inner) {
      // If going back from an inner step, go to the parent step
      setParentActiveStep(parentActiveStep - 1);
      setChildActiveStep(0);
    } else {
      // Otherwise, go to the previous step in the parent
      setParentActiveStep((prevActiveStep) => prevActiveStep - 1);
    }
  };

  const handleSkip = () => {
    if (!isStepOptional(parentActiveStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setParentActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(parentActiveStep);
      return newSkipped;
    });
  };

  const handleReset = () => {
    setParentActiveStep(0);
    setChildActiveStep(0);
  };

  return (
    <Box sx={{ width: "100%" }}>
      <Stepper orientation='vertical' activeStep={parentActiveStep}>
        {steps.map(({ label, description, inner }, index) => {
          const stepProps: { completed?: boolean } = {};
          const labelProps: {
            optional?: React.ReactNode;
          } = {};

          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }

          return (
            <Step key={label} {...stepProps}>
              <StepLabel {...labelProps}>{label}</StepLabel>

              {!inner ? null : (
                <StepContent>
                  <ChildStepper steps={inner} activeStep={childActiveStep} />
                </StepContent>
              )}
            </Step>
          );
        })}
      </Stepper>
      {parentActiveStep === steps.length ? (
        <React.Fragment>
          <Typography sx={{ mt: 2, mb: 1 }}>
            All steps completed - you&apos;re finished
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button onClick={handleReset}>Reset</Button>
          </Box>
        </React.Fragment>
      ) : (
        <React.Fragment>
          <Typography sx={{ mt: 2, mb: 1 }}>
            Step {parentActiveStep + 1}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Button
              color='inherit'
              disabled={parentActiveStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />
            {isStepOptional(parentActiveStep) && (
              <Button color='inherit' onClick={handleSkip} sx={{ mr: 1 }}>
                Skip
              </Button>
            )}
            <Button onClick={handleNext}>
              {parentActiveStep === steps.length - 1 ? "Finish" : "Next"}
            </Button>
          </Box>
        </React.Fragment>
      )}
    </Box>
  );
}

const ChildStepper: React.FC<{ steps: Step[]; activeStep: number }> = ({
  steps,
  activeStep = 0,
}) => {
  return (
    <Box>
      <Stepper orientation='vertical' activeStep={activeStep}>
        {steps.map(({ label, description }) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
};
