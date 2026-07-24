"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";

interface EditModeContextType {
  isEditMode: boolean;
  passcode: string;
  unlock: (passcode: string) => Promise<boolean>;
  lock: () => void;
}

const EditModeContext = createContext<EditModeContextType>({
  isEditMode: false,
  passcode: "",
  unlock: async () => false,
  lock: () => {},
});

export function EditModeProvider({ children }: { children: React.ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [passcode, setPasscode] = useState("");

  // On mount, check sessionStorage for existing passcode
  useEffect(() => {
    const stored = sessionStorage.getItem("nova_passcode");
    if (stored) {
      // Verify the stored passcode is still valid
      fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: stored }),
      })
        .then((res) => {
          if (res.ok) {
            setPasscode(stored);
            setIsEditMode(true);
          } else {
            sessionStorage.removeItem("nova_passcode");
          }
        })
        .catch(() => {
          sessionStorage.removeItem("nova_passcode");
        });
    }
  }, []);

  const unlock = useCallback(async (input: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode: input }),
      });

      if (res.ok) {
        setPasscode(input);
        setIsEditMode(true);
        sessionStorage.setItem("nova_passcode", input);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const lock = useCallback(() => {
    setIsEditMode(false);
    setPasscode("");
    sessionStorage.removeItem("nova_passcode");
  }, []);

  return (
    <EditModeContext.Provider value={{ isEditMode, passcode, unlock, lock }}>
      {children}
    </EditModeContext.Provider>
  );
}

export function useEditMode() {
  return useContext(EditModeContext);
}
