import React, { useCallback } from "react";

import "./browser.scss";

import { Icon } from "../../../../shared/components/Icon/Icon";
import { useEnhancedAppContext } from "../../../context";
import { useTranslation } from "../../../../i18n/hooks/useTranslation";
import { BROWSER_MODE } from "../../types";

export const BrowserHeader: React.FC = () => {
  const appContext = useEnhancedAppContext();

  if (!appContext) {
    console.error("BrowserHeader: AppContext not found");
  }
  //@ts-ignore

  const { windowState, setBrowserMode, clearVisible } = appContext;
  const { t } = useTranslation();
  const handleClose = useCallback(() => {
    clearVisible();
    setBrowserMode(BROWSER_MODE.CLOSED);
  }, [clearVisible, setBrowserMode]);

  const handleMinimize = useCallback(() => {
    setBrowserMode(
      windowState === BROWSER_MODE.MINIMIZED
        ? BROWSER_MODE.OPEN
        : BROWSER_MODE.MINIMIZED
    );
  }, [setBrowserMode, windowState]);

  const handleMaximize = useCallback(() => {
    setBrowserMode(
      windowState === BROWSER_MODE.MAXIMIZED
        ? BROWSER_MODE.OPEN
        : BROWSER_MODE.MAXIMIZED
    );
  }, [setBrowserMode, windowState]);

  return (
    <div className="browser-header">
      <div className="window-controls">
        <button
          className="control-btn close-btn"
          onClick={handleClose}
          aria-label={t.browser.windowControls.close}
        >
          <Icon name="close" className="control-icon" size={8} />
        </button>
        <button
          className="control-btn minimize-btn"
          onClick={handleMinimize}
          aria-label={t.browser.windowControls.minimize}
        >
          <Icon name="minimize" className="control-icon" size={8} />
        </button>
        <button
          className="control-btn maximize-btn"
          onClick={handleMaximize}
          aria-label={t.browser.windowControls.maximize}
        >
          <Icon name="maximize" className="control-icon" size={10} />
        </button>
      </div>

      {/* <div className="browser-title">{t.browser.title}</div> */}
    </div>
  );
};
