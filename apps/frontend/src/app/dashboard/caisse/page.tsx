"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function CaissePage() {
  const [isOpen, setIsOpen] = useState(false);
  const [balance, setBalance] = useState("");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Caisse</h1>

      {!isOpen ? (
        <Card className="max-w-md">
          <CardHeader><CardTitle>Ouvrir la caisse</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <Input
              type="number"
              placeholder="Solde d'ouverture (FCFA)"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
            />
            <Button onClick={() => setIsOpen(true)} className="w-full">
              Ouvrir
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant="default">Caisse ouverte</Badge>
            <span className="text-sm text-muted-foreground">
              Solde: {balance || "0"} FCFA
            </span>
          </div>

          <Card>
            <CardHeader><CardTitle>Nouvelle transaction</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input type="number" placeholder="Montant (FCFA)" />
              <Input placeholder="Description" />
              <div className="flex gap-2">
                <Button className="flex-1">Vente</Button>
                <Button variant="outline" className="flex-1">Dépense</Button>
              </div>
            </CardContent>
          </Card>

          <Button variant="destructive" onClick={() => setIsOpen(false)}>
            Fermer la caisse
          </Button>
        </div>
      )}
    </div>
  );
}
