// src/components/ParticlesBackground.jsx
import React from "react";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";

const ParticlesBackground = () => {
  const particlesInit = async (main) => {
    await loadFull(main);
  };

  return (
    <Particles
      id="tsparticles"
      init={particlesInit}
      options={{
        fullScreen: {
          enable: true,
          zIndex: -1,
        },
        background: {
          
          position: "center",
          repeat: "no-repeat",
          size: "cover",
        },
        particles: {
          number: {
            value: 50,
            density: {
              enable: true,
              area: 900,
            },
          },
          color: {
            value: "#ffffff",
          },
          shape: {
            type: "circle",
          },
          opacity: {
            value: 1,
          },
          size: {
            value: { min: 1, max: 3 },
          },
          move: {
            enable: true,
            speed: 0.5,
            direction: "none",
            outModes: {
              default: "bounce",
            },
          },
          links: {
            enable: true,
            distance: 150,
            color: "#ffffff",
            opacity: 0.5,
            width: 2,
          },
        },
        interactivity: {
          events: {
            onHover: {
              enable: true,
              mode: "grab",
            },
          },
          modes: {
            grab: {
              distance: 200,
              links: {
                opacity: 1,
              },
            },
          },
        },
        detectRetina: true,
      }}
    />
  );
};

export default React.memo(ParticlesBackground);
