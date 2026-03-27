import { useEffect, useRef } from "react";

export function useKeyboardShortcuts(shortcuts) {
    const shortcutsRef = useRef(shortcuts);

    // Keep ref updated without re-registering listener
    useEffect(() => {
        shortcutsRef.current = shortcuts;
    }, [shortcuts]);

    useEffect(() => {
        const handler = (e) => {
            const tag = document.activeElement?.tagName;
            if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;

            shortcutsRef.current.forEach(({ key, altKey = false, callback }) => {
                if (
                    e.key.toLowerCase() === key.toLowerCase() &&
                    e.altKey === altKey
                ) {
                    e.preventDefault();
                    callback();
                }
            });
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []); // ✅ empty — registers only once
}