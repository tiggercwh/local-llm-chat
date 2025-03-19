"use client"

import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface ModelSelectorProps {
  isLocalModel: boolean
  onTypeChange: (isLocal: boolean) => void
}

export function ModelSelector({ isLocalModel, onTypeChange }: ModelSelectorProps) {
  return (
    <div className="flex items-center space-x-2">
      <Switch id="model-type" checked={isLocalModel} onCheckedChange={onTypeChange} />
      <Label htmlFor="model-type">{isLocalModel ? "Using Local Model" : "Using API Model"}</Label>
    </div>
  )
}

