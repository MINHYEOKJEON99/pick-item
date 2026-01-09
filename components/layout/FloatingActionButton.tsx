"use client";

import { useRouter } from "next/navigation";
import { Plus, X, Package, MessageCircle, Heart } from "lucide-react";
import * as Popover from "@radix-ui/react-popover";

interface FloatingActionButtonProps {
  isLoggedIn: boolean;
}

const menuItems = [
  {
    icon: Package,
    label: "상품등록",
    href: "/products/new",
    color: "bg-primary",
  },
  {
    icon: MessageCircle,
    label: "채팅",
    href: "/chat",
    color: "bg-green-500",
  },
  {
    icon: Heart,
    label: "찜목록",
    href: "/wishlist",
    color: "bg-rose-500",
  },
];

export default function FloatingActionButton({ isLoggedIn }: FloatingActionButtonProps) {
  const router = useRouter();

  if (!isLoggedIn) return null;

  const handleItemClick = (href: string) => {
    router.push(href);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            className="w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary-hover transition-all duration-200 flex items-center justify-center group hover:scale-105 active:scale-95"
            aria-label="메뉴 열기"
          >
            <Plus className="w-7 h-7 transition-transform duration-200 group-data-[state=open]:rotate-45" />
          </button>
        </Popover.Trigger>

        <Popover.Portal>
          <Popover.Content
            side="top"
            align="end"
            sideOffset={12}
            className="z-50 animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 duration-200"
          >
            <div className="flex flex-col gap-3">
              {menuItems.map((item, index) => (
                <button
                  key={item.href}
                  onClick={() => handleItemClick(item.href)}
                  className="flex items-center gap-3 group"
                  style={{
                    animationDelay: `${index * 50}ms`,
                  }}
                >
                  <span className="text-sm font-medium text-gray-700 bg-white px-3 py-1.5 rounded-lg shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.label}
                  </span>
                  <div
                    className={`w-12 h-12 ${item.color} text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform`}
                  >
                    <item.icon className="w-5 h-5" />
                  </div>
                </button>
              ))}
            </div>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </div>
  );
}
