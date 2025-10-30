import { forwardRef } from "react";
import { clsx } from "clsx";

const ModalOverlay = forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={clsx(
      "fixed inset-0 bg-black/50 z-40",
      className
    )}
    {...props}
  />
));
ModalOverlay.displayName = "ModalOverlay";

const ModalContainer = forwardRef(({ className, size = "md", ...props }, ref) => {
  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };
  return (
    <div
      ref={ref}
      className={clsx(
        "fixed inset-0 z-50 flex items-center justify-center p-4",
        className
      )}
      {...props}
    >
      <div className={clsx("w-full", sizes[size])}>
        {props.children}
      </div>
    </div>
  );
});
ModalContainer.displayName = "ModalContainer";

const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <>
      <ModalOverlay onClick={onClose} />
      <ModalContainer>
        <div className="bg-bg-60 border border-bd-50 rounded-2xl shadow-xl overflow-hidden">
          {children}
        </div>
      </ModalContainer>
    </>
  );
};

const ModalHeader = ({ className, title, children, action }) => (
  <div className={clsx("px-5 py-4  flex items-center justify-between", className)}>
    <h3 className="text-base font-semibold text-fg-40">{title}</h3>
    {action || children}
  </div>
);

const ModalBody = ({ className, children }) => (
  <div className={clsx("px-5 py-4", className)}>{children}</div>
);

const ModalFooter = ({ className, children }) => (
  <div className={clsx("px-5 py-4 flex items-center justify-end gap-2", className)}>
    {children}
  </div>
);

export { Modal, ModalHeader, ModalBody, ModalFooter };