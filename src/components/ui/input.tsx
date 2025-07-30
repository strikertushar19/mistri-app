"use client";
import dynamic from "next/dynamic";
import * as React from "react";

const AceternityInput = dynamic(() =>
  import("../aceternity/input").then((mod) => mod.AnimatedInput)
, { ssr: false });

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    return <AceternityInput {...props} ref={ref} />;
  }
);

Input.displayName = "Input";

export { Input };
