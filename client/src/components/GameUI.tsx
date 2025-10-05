import { useGameState } from "../lib/stores/useGameState";
import { Card } from "./Card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { SoundToggle } from "./SoundToggle";
import { useState } from "react";
import { Card as UICard, CardContent } from "./ui/card";
import { Package } from "lucide-react";
import { GameCard } from "../types/cards";

export function GameUI() {
  const { gameState, endTurn, playCard, applyBonus } = useGameState();
  const [selectedBonusCard, setSelectedBonusCard] = useState<string | null>(null);
  const [selectedTargetCard, setSelectedTargetCard] = useState<string | null>(null);

  if (!gameState) return null;

  const currentHand = gameState.currentPlayer === "white_guard" 
    ? gameState.whiteGuardHand 
    : gameState.bolshevikHand;

  const currentSupply = gameState.currentPlayer === "white_guard" 
    ? gameState.whiteGuardSupply 
    : gameState.bolshevikSupply;

  const currentField = gameState.currentPlayer === "white_guard" 
    ? gameState.whiteGuardField 
    : gameState.bolshevikField;

  const handleCardPlay = (cardId: string) => {
    const card = currentHand.find((c: GameCard) => c.id === cardId);
    if (!card) return;

    if (card.type === "unit") {
      playCard(cardId);
    } else if (card.type === "bonus") {
      if (selectedBonusCard === cardId) {
        setSelectedBonusCard(null);
      } else {
        setSelectedBonusCard(cardId);
        setSelectedTargetCard(null);
      }
    }
  };

  const handleTargetSelection = (targetCardId: string) => {
    if (selectedBonusCard) {
      if (applyBonus(selectedBonusCard, targetCardId)) {
        setSelectedBonusCard(null);
        setSelectedTargetCard(null);
      }
    } else {
      setSelectedTargetCard(targetCardId);
    }
  };

  const getFactionDisplay = () => {
    if (gameState.currentPlayer === "white_guard") {
      return { name: "Белая Гвардия", color: "text-white-guard", bgColor: "bg-white-guard/10", borderColor: "border-white-guard/30" };
    } else {
      return { name: "Большевики", color: "text-bolshevik", bgColor: "bg-bolshevik/10", borderColor: "border-bolshevik/30" };
    }
  };

  const faction = getFactionDisplay();

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Top HUD */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-auto z-10">
        <UICard className="border-2 backdrop-blur-md bg-card/95">
          <CardContent className="p-4">
            <div className={`text-lg font-bold ${faction.color} mb-1`}>
              {faction.name}
            </div>
            <div className="text-sm text-muted-foreground flex items-center gap-4">
              <span>Ход: <span className="font-bold text-foreground">{gameState.turn}</span></span>
              <span className="flex items-center gap-1">
                <Package className="w-4 h-4" />
                Снабжение: <Badge variant="outline" className="ml-1">{currentSupply}</Badge>
              </span>
            </div>
          </CardContent>
        </UICard>

        <div className="flex gap-2">
          <SoundToggle />
          <Button
            onClick={endTurn}
            size="lg"
            className="bg-success hover:bg-success/90 hover-elevate active-elevate-2"
            data-testid="button-end-turn"
          >
            Завершить ход
          </Button>
        </div>
      </div>

      {/* Hand (Bottom) */}
      <div className="absolute bottom-4 left-4 right-4 pointer-events-auto z-10">
        <UICard className="backdrop-blur-md bg-card/95 border-2">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <h3 className="font-bold text-foreground">Рука</h3>
              {selectedBonusCard && (
                <Badge variant="destructive" className="animate-pulse">
                  Выберите цель для бонуса
                </Badge>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {currentHand.map((card: GameCard) => {
                const canPlay = currentSupply >= card.cost;
                return (
                  <Card
                    key={card.id}
                    card={card}
                    isOwned={true}
                    onSelect={() => handleCardPlay(card.id)}
                    isSelected={selectedBonusCard === card.id}
                    className={`flex-shrink-0 ${!canPlay ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                );
              })}
              {currentHand.length === 0 && (
                <div className="text-muted-foreground text-center py-8 w-full">
                  Нет карт в руке
                </div>
              )}
            </div>
          </CardContent>
        </UICard>
      </div>

      {/* Field Units (For bonus targeting) */}
      {selectedBonusCard && currentField.length > 0 && (
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 pointer-events-auto z-10">
          <UICard className="backdrop-blur-md bg-card/95 border-2">
            <CardContent className="p-4">
              <h4 className="font-bold mb-3 text-foreground">Выберите цель:</h4>
              <div className="space-y-2">
                {currentField.map((card: GameCard) => (
                  <div
                    key={card.id}
                    onClick={() => handleTargetSelection(card.id)}
                    className="flex items-center gap-2 p-2 bg-muted/50 rounded-md cursor-pointer hover:bg-muted transition-colors"
                  >
                    <span className="text-xl">{card.emoji}</span>
                    <span className="text-sm font-medium text-foreground">{card.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </UICard>
        </div>
      )}

      {/* Game Status */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-auto z-10">
        {selectedBonusCard && (
          <UICard className="border-2 border-warning/50 bg-warning/10 backdrop-blur-md">
            <CardContent className="p-4">
              <p className="font-bold text-warning text-center">
                Применить бонус к юниту на поле
              </p>
            </CardContent>
          </UICard>
        )}
      </div>
    </div>
  );
}
