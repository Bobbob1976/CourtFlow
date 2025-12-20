"use client";

import { useState, useEffect } from "react";
import { X, Bell, CheckCircle, AlertCircle, Info } from "lucide-react";

interface Notification {
    id: string;
    type: "success" | "error" | "info" | "warning";
    title: string;
    message: string;
    duration?: number;
}

let notificationId = 0;
const notifications: Notification[] = [];
const listeners: Set<(notifications: Notification[]) => void> = new Set();

export const showNotification = (notification: Omit<Notification, "id">) => {
    const id = `notification-${notificationId++}`;
    const newNotification = { ...notification, id };
    notifications.push(newNotification);
    listeners.forEach(listener => listener([...notifications]));

    // Auto-remove after duration
    if (notification.duration !== 0) {
        setTimeout(() => {
            removeNotification(id);
        }, notification.duration || 5000);
    }
};

const removeNotification = (id: string) => {
    const index = notifications.findIndex(n => n.id === id);
    if (index > -1) {
        notifications.splice(index, 1);
        listeners.forEach(listener => listener([...notifications]));
    }
};

export default function NotificationContainer() {
    const [activeNotifications, setActiveNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        listeners.add(setActiveNotifications);
        return () => {
            listeners.delete(setActiveNotifications);
        };
    }, []);

    const getIcon = (type: Notification["type"]) => {
        switch (type) {
            case "success":
                return <CheckCircle className="w-5 h-5 text-green-400" />;
            case "error":
                return <AlertCircle className="w-5 h-5 text-red-400" />;
            case "warning":
                return <AlertCircle className="w-5 h-5 text-yellow-400" />;
            case "info":
                return <Info className="w-5 h-5 text-blue-400" />;
        }
    };

    const getStyles = (type: Notification["type"]) => {
        switch (type) {
            case "success":
                return "bg-green-500/10 border-green-500/30 text-green-400";
            case "error":
                return "bg-red-500/10 border-red-500/30 text-red-400";
            case "warning":
                return "bg-yellow-500/10 border-yellow-500/30 text-yellow-400";
            case "info":
                return "bg-blue-500/10 border-blue-500/30 text-blue-400";
        }
    };

    return (
        <div className="fixed top-4 right-4 z-[100] space-y-3 max-w-sm w-full pointer-events-none">
            {activeNotifications.map((notification, index) => (
                <div
                    key={notification.id}
                    className={`pointer-events-auto transform transition-all duration-300 ease-out ${index === 0 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-90"
                        }`}
                    style={{
                        animation: "slideInRight 0.3s ease-out",
                    }}
                >
                    <div
                        className={`${getStyles(notification.type)} border rounded-2xl p-4 shadow-2xl backdrop-blur-lg`}
                    >
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                                {getIcon(notification.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-white mb-1">{notification.title}</h4>
                                <p className="text-sm text-gray-300">{notification.message}</p>
                            </div>
                            <button
                                onClick={() => removeNotification(notification.id)}
                                className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
        </div>
    );
}

// Helper functions for easy use
export const notify = {
    success: (title: string, message: string, duration?: number) =>
        showNotification({ type: "success", title, message, duration }),
    error: (title: string, message: string, duration?: number) =>
        showNotification({ type: "error", title, message, duration }),
    warning: (title: string, message: string, duration?: number) =>
        showNotification({ type: "warning", title, message, duration }),
    info: (title: string, message: string, duration?: number) =>
        showNotification({ type: "info", title, message, duration }),
};
