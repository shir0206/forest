// import React, { useCallback } from "react";
// import { useBrowserContext } from "../../../contexts/BrowserContext";
// import { Icon } from "../Icon/Icon";
// import { WINDOW_STATE } from "../../../types/app";
// import { useAppContext } from "../../../contexts/AppContext";

// interface WindowControlsProps {}

// export const WindowControls: React.FC<WindowControlsProps> = ({}) => {
//   const { t } = useBrowserContext();
//   const { windowState, setWindowState, clearVisible } = useAppContext();

//   const handleClose = useCallback(
//     (event: React.MouseEvent) => {
//       clearVisible();
//       setWindowState(WINDOW_STATE.CLOSED);
//     },
//     [clearVisible, setWindowState]
//   );

//   const handleMinimize = useCallback(() => {
//     setWindowState(
//       windowState === WINDOW_STATE.MINIMIZED
//         ? WINDOW_STATE.OPEN
//         : WINDOW_STATE.MINIMIZED
//     );
//   }, [setWindowState, windowState]);

//   const handleMaximize = useCallback(() => {
//     setWindowState(
//       windowState === WINDOW_STATE.MAXIMIZED
//         ? WINDOW_STATE.OPEN
//         : WINDOW_STATE.MAXIMIZED
//     );
//   }, [setWindowState, windowState]);

//   return (
//     <div className="browser-header">
//       <div className="window-controls">
//         <button
//           className="control-btn close-btn"
//           onClick={handleClose}
//           aria-label={t.browser.windowControls.close}
//         >
//           <Icon name="close" className="control-icon" size={8} />
//         </button>
//         <button
//           className="control-btn minimize-btn"
//           onClick={handleMinimize}
//           aria-label={t.browser.windowControls.minimize}
//         >
//           <Icon name="minimize" className="control-icon" size={8} />
//         </button>
//         <button
//           className="control-btn maximize-btn"
//           onClick={handleMaximize}
//           aria-label={t.browser.windowControls.maximize}
//         >
//           <Icon name="maximize" className="control-icon" size={10} />
//         </button>
//       </div>

//       <div className="browser-title">{t.browser.title}</div>
//     </div>
//   );
// };
