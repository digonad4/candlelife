/**
 * Constantes de estilo para padronização da aplicação
 * Usar estes valores garante consistência visual em todas as telas
 */

export const LAYOUT_STYLES = {
  page: {
    container: "w-full space-y-6 safe-area-top safe-area-bottom",
    maxWidth: "max-w-7xl mx-auto",
    padding: "p-4 md:p-6"
  },
  card: {
    base: "rounded-xl border border-border bg-card shadow-sm",
    header: "p-6",
    content: "p-6",
    footer: "p-6 pt-0"
  },
  spacing: {
    section: "space-y-6",
    cardGap: "gap-6"
  }
} as const;

/**
 * Função helper para combinar classes de página
 */
export const getPageClasses = () => {
  return `${LAYOUT_STYLES.page.container} ${LAYOUT_STYLES.page.maxWidth} ${LAYOUT_STYLES.page.padding}`;
};

/**
 * Função helper para combinar classes de card
 */
export const getCardClasses = () => {
  return LAYOUT_STYLES.card.base;
};
