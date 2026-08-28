"use client";
import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useState,
  type MouseEvent,
} from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";

import {
  BOOKING_LINK,
  SOCIAL_LINKS,
} from "@/lib/siteLinks";

import styles from "./SiteHeader.module.css";

type NavItem = {
  label: string;
  href?: string;
  section?: string;
};

const navItems: NavItem[] = [
  {
    label: "О НАС",
    section: "about",
  },
  {
    label: "МЕНЮ",
    href: "/menu",
  },
  {
    label: "ДОСТАВКА",
    href: "/delivery",
  },
  {
    label: "АФИША",
    href: "/events",
  },
  {
    label: "ПРОСТРАНСТВО",
    section: "space",
  },
  {
    label: "КОНТАКТЫ",
    section: "contacts",
  },
];

export function SiteHeader() {
  const pathname = usePathname();

  const [scrolled, setScrolled] =
    useState(false);

  const [mobileOpen, setMobileOpen] =
    useState(false);
    const [mounted, setMounted] =
  useState(false);

useEffect(() => {
  setMounted(true);
}, []);

  useEffect(() => {
    function handleScroll() {
      setScrolled(
        window.scrollY > 24
      );
    }

    handleScroll();

    window.addEventListener(
      "scroll",
      handleScroll,
      {
        passive: true,
      }
    );

    return () => {
      window.removeEventListener(
        "scroll",
        handleScroll
      );
    };
  }, []);

  /*
   * При переходе на другую страницу
   * закрываем мобильное меню.
   */
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  /*
   * Пока мобильное меню открыто —
   * страница под ним не прокручивается.
   */
  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [mobileOpen]);

  function scrollToSection(
    sectionId: string
  ) {
    const section =
      document.getElementById(
        sectionId
      );

    if (!section) {
      return;
    }

    section.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    window.history.replaceState(
      null,
      "",
      `#${sectionId}`
    );
  }

  function handleMainSectionClick(
    event: MouseEvent<HTMLAnchorElement>,
    sectionId: string
  ) {
    event.preventDefault();

    setMobileOpen(false);

    requestAnimationFrame(() => {
      scrollToSection(sectionId);
    });
  }

  function isActive(
    href?: string
  ) {
    if (!href) {
      return false;
    }

    return pathname === href;
  }

  return (
    <>
      <div
        className={`${styles.shell} ${
          scrolled
            ? styles.scrolled
            : ""
        }`}
      >
        <div
          className={
            styles.topOrnament
          }
          aria-hidden="true"
        />

        <header
          className={styles.header}
        >
          <Link
            href="/"
            className={styles.logo}
            aria-label="Агнива — главная"
            onClick={() => {
              setMobileOpen(false);
            }}
          >
            <Image
              src="/brand/agniva-logo.svg"
              alt="Агнива"
              width={260}
              height={120}
              priority
            />
          </Link>

          {/* DESKTOP NAVIGATION */}

          <nav
            className={styles.nav}
            aria-label="Основная навигация"
          >
            {navItems.map((item) => {
              const className =
                isActive(item.href)
                  ? styles.active
                  : undefined;

              if (item.section) {
                const sectionId =
                  item.section;

                if (pathname === "/") {
                  return (
                    <a
                      key={item.label}
                      href={`#${sectionId}`}
                      className={className}
                      onClick={(event) =>
                        handleMainSectionClick(
                          event,
                          sectionId
                        )
                      }
                    >
                      {item.label}
                    </a>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={`/#${sectionId}`}
                    className={className}
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <Link
                  key={item.label}
                  href={item.href!}
                  className={className}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* DESKTOP ACTIONS */}

          <div
            className={styles.actions}
          >
            {SOCIAL_LINKS.telegramBot && (
              <a
                href={
                  SOCIAL_LINKS.telegramBot
                }
                target="_blank"
                rel="noreferrer"
                className={
                  styles.telegram
                }
                aria-label="Telegram Агнивы"
              >
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M21.7 3.4 18.5 19c-.2 1.1-.9 1.4-1.8.9l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.4-5 9.1-8.2c.4-.4-.1-.6-.6-.2L6 12.8 1.2 11.3c-1-.3-1-1 .2-1.5L20 2.6c.9-.3 1.9.2 1.7.8Z"
                    fill="currentColor"
                  />
                </svg>
              </a>
            )}

            <a
              href={BOOKING_LINK}
              target="_blank"
              rel="noreferrer"
              className={styles.booking}
            >
              ЗАБРОНИРОВАТЬ
            </a>
          </div>

          {/* MOBILE BURGER */}

          <button
            type="button"
            className={`${styles.menuButton} ${
              mobileOpen
                ? styles.menuButtonOpen
                : ""
            }`}
            aria-label={
              mobileOpen
                ? "Закрыть меню"
                : "Открыть меню"
            }
            aria-expanded={mobileOpen}
            onClick={() => {
              setMobileOpen(
                (current) => !current
              );
            }}
          >
            <span />
            <span />
          </button>
        </header>

        {/* MOBILE MENU */}

      {mounted && mobileOpen && createPortal(
          <div
            className={styles.mobileMenu}
          >
            <div
              className={
                styles.mobileMenuInner
              }
            >
              <span
                className={
                  styles.mobileLabel
                }
              >
                НАВИГАЦИЯ
              </span>

              <nav
                className={
                  styles.mobileNav
                }
                aria-label="Мобильная навигация"
              >
                {navItems.map(
                  (item) => {
                    const className = `${
                      styles.mobileLink
                    } ${
                      isActive(
                        item.href
                      )
                        ? styles.mobileActive
                        : ""
                    }`;

                    if (item.section) {
                      const sectionId =
                        item.section;

                      if (
                        pathname === "/"
                      ) {
                        return (
                          <a
                            key={
                              item.label
                            }
                            href={`#${sectionId}`}
                            className={
                              className
                            }
                            onClick={(
                              event
                            ) =>
                              handleMainSectionClick(
                                event,
                                sectionId
                              )
                            }
                          >
                            {
                              item.label
                            }
                          </a>
                        );
                      }

                      return (
                        <Link
                          key={
                            item.label
                          }
                          href={`/#${sectionId}`}
                          className={
                            className
                          }
                          onClick={() => {
                            setMobileOpen(
                              false
                            );
                          }}
                        >
                          {
                            item.label
                          }
                        </Link>
                      );
                    }

                    return (
                      <Link
                        key={
                          item.label
                        }
                        href={
                          item.href!
                        }
                        className={
                          className
                        }
                        onClick={() => {
                          setMobileOpen(
                            false
                          );
                        }}
                      >
                        {item.label}
                      </Link>
                    );
                  }
                )}
              </nav>

              <div
                className={
                  styles.mobileBottom
                }
              >
                <a
                  href={BOOKING_LINK}
                  target="_blank"
                  rel="noreferrer"
                  className={
                    styles.mobileBooking
                  }
                >
                  ЗАБРОНИРОВАТЬ
                  <span>↗</span>
                </a>

                <div
                  className={
                    styles.mobileSocials
                  }
                >
                  {SOCIAL_LINKS.telegramBot && (
                    <a
                      href={
                        SOCIAL_LINKS.telegramBot
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      TELEGRAM
                    </a>
                  )}

                  {SOCIAL_LINKS.instagram && (
                    <a
                      href={
                        SOCIAL_LINKS.instagram
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      INSTAGRAM
                    </a>
                  )}

                  {SOCIAL_LINKS.vk && (
                    <a
                      href={
                        SOCIAL_LINKS.vk
                      }
                      target="_blank"
                      rel="noreferrer"
                    >
                      ВКОНТАКТЕ
                    </a>
                  )}
                </div>
                           </div>
            </div>
          </div>,
          document.body
        )}
      </div>

      {pathname !== "/" && (
  <div className={styles.spacer} />
)}
      
    </>
  );
}