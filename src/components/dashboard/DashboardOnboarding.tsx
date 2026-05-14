"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Step, CallBackProps, STATUS } from "react-joyride";

const Joyride = dynamic(() => import("react-joyride"), { ssr: false });

export default function DashboardOnboarding() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem("onboarding_complete");
    if (!hasSeenOnboarding) {
      setRun(true);
    }
  }, []);

  const steps: Step[] = [
    {
      target: ".step-generator",
      content: "Aquí es donde ocurre la magia. Describe un tema y nuestra IA generará un hilo viral en segundos.",
      placement: "right",
      disableBeacon: true,
    },
    {
      target: ".step-twitter",
      content: "Conecta tu cuenta de Twitter/X para publicar directamente o programar tus hilos.",
      placement: "right",
    },
    {
      target: ".step-analytics",
      content: "Mide el impacto de tus hilos con analíticas detalladas y optimiza tu estrategia de crecimiento.",
      placement: "right",
    },
    {
      target: ".step-api",
      content: "Si eres desarrollador, puedes usar nuestra API para integrar la generación de hilos en tus propios flujos.",
      placement: "right",
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as any)) {
      setRun(false);
      localStorage.setItem("onboarding_complete", "true");
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: "#6366f1",
          textColor: "#1e293b",
          zIndex: 1000,
        },
        tooltipContainer: {
          textAlign: "left",
          borderRadius: "16px",
          padding: "10px",
        },
        buttonNext: {
          borderRadius: "8px",
          fontWeight: "bold",
        },
        buttonBack: {
          marginRight: "10px",
        },
      }}
      locale={{
        back: "Atrás",
        close: "Cerrar",
        last: "Finalizar",
        next: "Siguiente",
        skip: "Saltar",
      }}
    />
  );
}
