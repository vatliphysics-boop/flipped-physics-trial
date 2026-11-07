"use client";
import {createContext,useContext} from "react";
export const LocalAIAvailability=createContext(false);
export function useLocalAIAvailable(){return useContext(LocalAIAvailability);}
