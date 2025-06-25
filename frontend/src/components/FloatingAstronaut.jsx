import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import astronautImg from "../assets/astronaut.png";

function FloatingAstronaut({ controls, resultsVisible, hasShownResults }) {
  const [hasStartedInfinity, setHasStartedInfinity] = useState(false);
  const [infinityStartTimestamp, setInfinityStartTimestamp] = useState(null);

  const [balloonMessage, setBalloonMessage] = useState(
    "Bem-vindo ao Infinite Search, está muito escuro aqui não é mesmo? Clique na tela!"
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
const floatingFacts = [
  "Sabia que a Lua se afasta da Terra 3,8 cm por ano?",
  "Elasticsearch usa Lucene por baixo dos panos... é tipo o motor da nave!",
  "Estou procurando respostas nos confins do universo!",
  "Você já tentou pesquisar por buracos negros?",
  "Consultas no Elasticsearch são como sondas espaciais: rápidas e precisas!",
  "O silêncio do espaço é mais profundo do que parece.",
  "Não se assuste, estou bem, só explorando!",
  "Existe uma estrela que brilha tanto quanto um diamante!",
  "O tempo passa mais devagar perto de buracos negros.",
  "Com Elasticsearch, dá pra buscar até por frases exatas... tipo \"vida alienígena\"!",
  "Netuno tem ventos supersônicos mais rápidos que a velocidade do som!",
  "Quer escalar até a lua? O Elasticsearch escala horizontalmente!",
  "Você está vendo isso? Acho que vi um alien ali!",
  "Os shards do Elasticsearch dividem dados como planetas em sistemas solares!",
  "Já tentou pesquisar por 'mistérios cósmicos'?",
  "Planetas podem flutuar livremente pelo espaço sem estrela!",
  "Sabia que o Elasticsearch pode indexar milhões de documentos em segundos?",
  "Mapear campos no Elasticsearch é como traçar rotas interestelares!",
  "Analisadores quebram texto em pedaços, como cometas cruzando o espaço!",
  "O cluster do Elasticsearch é como uma galáxia: cheio de nós brilhantes!"
];
;

  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    if (!hasStartedInfinity) return;

    const interval = setInterval(() => {
      setCurrentMessageIndex(
        (prevIndex) => (prevIndex + 1) % floatingFacts.length
      );
    }, 20000); // troca a cada 10 segundos

    // define a primeira frase assim que começa
    setBalloonMessage(floatingFacts[0]);

    return () => clearInterval(interval);
  }, [hasStartedInfinity, floatingFacts.length, floatingFacts]);

  useEffect(() => {
    if (hasStartedInfinity) {
      setBalloonMessage(floatingFacts[currentMessageIndex]);
    }
  }, [currentMessageIndex, hasStartedInfinity, floatingFacts]);

  useEffect(() => {
    const handleClick = () => {
      setBalloonMessage(
        "Aqui você pode pesquisar qualquer coisa, mas cuidado para não me jogar para longe!"
      );
    };

    window.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("click", handleClick);
    };
  }, []);

  useEffect(() => {
    if (resultsVisible && !hasStartedInfinity) {
      controls
        .start({
          x: "20vw",
          y: "-150vh",
          rotate: -90,
          transition: {
            duration: 3,
            ease: "easeOut",
          },
        })
        .then(() =>
          controls.start({
            x: "-15vw", // usar os valores desejados diretamente aqui
            y: "0vh",
            rotate: 0,
            transition: {
              duration: 5,
              ease: "easeInOut",
            },
          })
        )
        .then(() => {
          setInfinityStartTimestamp(performance.now()); // <- armazena o tempo real atual
          setHasStartedInfinity(true);
        });
    } else if (!resultsVisible && !hasShownResults && !hasStartedInfinity) {
      controls.start({
        x: 0,
        y: [0, -20, 20, 0],
        rotate: [0, 2, -2, 0],
        transition: {
          duration: 6,
          ease: "easeInOut",
          repeat: Infinity,
        },
      });
    }
  }, [resultsVisible, hasShownResults, hasStartedInfinity, controls]);

  useEffect(() => {
    if (!hasStartedInfinity) return;

    let animationFrameId;
    let startTime = null;
    const radiusX = 50;
    const radiusY = 50;
    const horizontalOffset = -15;
    const verticalOffset = 0;
    const speed = 0.0001;
    const rotationAmplitude = 15;

    const updateAstronautPosition = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const t = elapsed * speed;

      const x = radiusX * Math.sin(t);
      const y = radiusY * Math.sin(t) * Math.cos(t);
      const rotate = rotationAmplitude * Math.sin(t);

      controls.set({
        x: `${x + horizontalOffset}vw`,
        y: `${y + verticalOffset}vh`,
        rotate,
      });

      animationFrameId = requestAnimationFrame(updateAstronautPosition);
    };

    animationFrameId = requestAnimationFrame(updateAstronautPosition);

    return () => cancelAnimationFrame(animationFrameId);
  }, [hasStartedInfinity, controls]);

  return (
    <motion.div className="floating-astronaut-container" animate={controls}>
      <img
        src={astronautImg}
        alt="Astronauta flutuando"
        className="floating-astronaut"
      />
      <div className="speech-balloon">
        <AnimatePresence mode="wait">
          <motion.div
            key={balloonMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {balloonMessage}
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default React.memo(FloatingAstronaut);
