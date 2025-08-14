import * as React from "react";
import { TooltipRenderProps } from "react-joyride";

const CustomTooltip: React.FC<TooltipRenderProps> = ({
  continuous,
  index,
  isLastStep,
  size,
  step,
  backProps,
  closeProps,
  primaryProps,
  skipProps,
  tooltipProps,
}: TooltipRenderProps) => {
  // Check if we're on the 4th step (index 3)
  const isFourthStep = index === 3;

  return (
    <div
      {...tooltipProps}
      className="joyride-tooltip max-w-[300px] sm:max-w-[400px]"
      style={{
        background: "linear-gradient(135deg, #F8FAFC 0%, #F1F5F9 100%)",
        borderRadius: "12px",
        padding: "24px",
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        border: "1px solid rgba(226, 232, 240, 0.8)",
      }}
    >
      <div
        style={{
          fontSize: "16px",
          lineHeight: "1.6",
          fontWeight: "500",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          color: "#1E293B",
          marginBottom: "16px",
        }}
      >
        {step.content}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Left side - Skip button */}
        {!isFourthStep && (
          <button
            {...skipProps}
            style={{
              color: "#64748B",
              fontSize: "15px",
              fontWeight: "500",
              fontFamily:
                "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Skip
          </button>
        )}

        {/* Right side - Navigation buttons */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {index > 0 && (
            <button
              {...backProps}
              style={{
                color: "#DB5888",
                marginRight: "10px",
                fontSize: "15px",
                fontWeight: "500",
                fontFamily:
                  "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Back
            </button>
          )}

          {!isLastStep && !isFourthStep && (
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                style={{
                  color: "#64748B",
                  fontSize: "14px",
                  fontWeight: "500",
                }}
              >
                {index + 1} of {size}
              </span>
              <button
                {...primaryProps}
                style={{
                  color: "#000000",
                  backgroundColor: "#5BC3CD",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  fontSize: "15px",
                  fontWeight: "600",
                  fontFamily:
                    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                  letterSpacing: "0.5px",
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 2px 4px rgba(91, 195, 205, 0.2)",
                }}
              >
                Next
              </button>
            </div>
          )}

          {isLastStep && (
            <button
              {...closeProps}
              style={{
                color: "#000000",
                backgroundColor: "#5BC3CD",
                borderRadius: "8px",
                padding: "10px 20px",
                fontSize: "15px",
                fontWeight: "600",
                fontFamily:
                  "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
                letterSpacing: "0.5px",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 2px 4px rgba(91, 195, 205, 0.2)",
              }}
            >
              Done
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomTooltip;
