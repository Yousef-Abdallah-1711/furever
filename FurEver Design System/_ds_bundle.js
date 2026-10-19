/* @ds-bundle: {"format":4,"namespace":"FurEverDesignSystem_f25da7","components":[{"name":"Avatar","sourcePath":"components/core/Avatar.jsx"},{"name":"Banner","sourcePath":"components/core/Banner.jsx"},{"name":"Button","sourcePath":"components/core/Button.jsx"},{"name":"Card","sourcePath":"components/core/Card.jsx"},{"name":"Chip","sourcePath":"components/core/Chip.jsx"},{"name":"EmptyState","sourcePath":"components/core/EmptyState.jsx"},{"name":"Icon","sourcePath":"components/core/Icon.jsx"},{"name":"IconButton","sourcePath":"components/core/IconButton.jsx"},{"name":"Input","sourcePath":"components/core/Input.jsx"},{"name":"PhaseTag","sourcePath":"components/core/PhaseTag.jsx"},{"name":"Rating","sourcePath":"components/core/Rating.jsx"},{"name":"Skeleton","sourcePath":"components/core/Skeleton.jsx"},{"name":"StatusBadge","sourcePath":"components/core/StatusBadge.jsx"},{"name":"ClinicCard","sourcePath":"components/domain/ClinicCard.jsx"},{"name":"ConfirmSheet","sourcePath":"components/domain/ConfirmSheet.jsx"},{"name":"PetCard","sourcePath":"components/domain/PetCard.jsx"},{"name":"SlotChip","sourcePath":"components/domain/SlotChip.jsx"},{"name":"Stepper","sourcePath":"components/domain/Stepper.jsx"}],"sourceHashes":{"components/core/Avatar.jsx":"f0d5f6313c55","components/core/Banner.jsx":"ccdc9f11a83c","components/core/Button.jsx":"381a74ed0433","components/core/Card.jsx":"c04692375911","components/core/Chip.jsx":"6868c8d005aa","components/core/EmptyState.jsx":"3c8627185aa9","components/core/Icon.jsx":"e10ae7f6e622","components/core/IconButton.jsx":"37d1d1219acc","components/core/Input.jsx":"bf72f1dc2be3","components/core/PhaseTag.jsx":"1f3b2337552f","components/core/Rating.jsx":"76c1687d62f8","components/core/Skeleton.jsx":"17aa2d60e313","components/core/StatusBadge.jsx":"01c64a7e2939","components/domain/ClinicCard.jsx":"53a07d8ff1ea","components/domain/ConfirmSheet.jsx":"d1dd9fbecc7b","components/domain/PetCard.jsx":"7189611d0dae","components/domain/SlotChip.jsx":"578897adf2d3","components/domain/Stepper.jsx":"6d0de5e6de17"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.FurEverDesignSystem_f25da7 = window.FurEverDesignSystem_f25da7 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/core/Avatar.jsx
try { (() => {
function Avatar({
  name = '',
  size = 40,
  src
}) {
  const ini = name.trim().split(/\s+/).slice(0, 2).map(s => s[0]).join('');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: size,
      height: size,
      borderRadius: '50%',
      background: 'var(--surface-secondary)',
      color: 'var(--primary)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 600,
      fontSize: size * .38,
      overflow: 'hidden',
      flex: 'none'
    }
  }, src ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: "",
    style: {
      width: '100%',
      height: '100%',
      objectFit: 'cover'
    }
  }) : ini);
}
Object.assign(__ds_scope, { Avatar });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Avatar.jsx", error: String((e && e.message) || e) }); }

// components/core/Card.jsx
try { (() => {
function Card({
  children,
  onClick,
  pad = 16,
  tint = false,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "fe-card",
    onClick: onClick,
    style: {
      padding: pad,
      cursor: onClick ? 'pointer' : undefined,
      background: tint ? 'var(--surface-secondary)' : undefined,
      borderColor: tint ? 'var(--primary)' : undefined,
      ...style
    }
  }, children);
}
Object.assign(__ds_scope, { Card });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Card.jsx", error: String((e && e.message) || e) }); }

// components/core/Icon.jsx
try { (() => {
const CDN = 'https://unpkg.com/lucide-static@0.469.0/icons/';
const cache = {};
const subs = {};
function load(name) {
  if (cache[name] !== undefined) return;
  cache[name] = null;
  fetch(CDN + name + '.svg').then(r => r.text()).then(s => {
    cache[name] = s.replace(/<!--[\s\S]*?-->/g, '').replace('width="24"', 'width="100%"').replace('height="24"', 'height="100%"').replace('stroke-width="2"', 'stroke-width="1.75"');
    (subs[name] || []).forEach(f => f());
  }).catch(() => {
    cache[name] = '';
  });
}
function Icon({
  name,
  size = 24,
  flip = false,
  label,
  style
}) {
  const [, tick] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => {
    load(name);
    (subs[name] = subs[name] || []).push(tick);
    return () => {
      subs[name] = (subs[name] || []).filter(f => f !== tick);
    };
  }, [name]);
  load(name);
  return /*#__PURE__*/React.createElement("span", {
    role: label ? 'img' : undefined,
    "aria-label": label,
    "aria-hidden": label ? undefined : true,
    className: 'fe-icon' + (flip ? ' flip' : ''),
    style: {
      '--s': size + 'px',
      ...style
    },
    dangerouslySetInnerHTML: {
      __html: cache[name] || ''
    }
  });
}
Object.assign(__ds_scope, { Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Icon.jsx", error: String((e && e.message) || e) }); }

// components/core/Banner.jsx
try { (() => {
const IC = {
  info: 'info',
  warning: 'triangle-alert',
  danger: 'circle-alert',
  success: 'circle-check'
};
function Banner({
  tone = 'info',
  action,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: 'fe-banner ' + tone,
    role: tone === 'danger' ? 'alert' : 'status'
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: IC[tone],
    size: 20
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1
    }
  }, children), action);
}
Object.assign(__ds_scope, { Banner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Banner.jsx", error: String((e && e.message) || e) }); }

// components/core/Button.jsx
try { (() => {
function Button({
  variant = 'primary',
  size = 'l',
  block = false,
  loading = false,
  disabled = false,
  icon,
  children,
  onClick,
  style,
  type = 'button'
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: type,
    className: ['fe-btn', variant, size, block && 'block', loading && 'loading'].filter(Boolean).join(' '),
    disabled: disabled,
    onClick: onClick,
    style: style,
    "aria-busy": loading || undefined
  }, loading ? /*#__PURE__*/React.createElement("span", {
    className: "fe-spin"
  }) : icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 20
  }), children);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Button.jsx", error: String((e && e.message) || e) }); }

// components/core/Chip.jsx
try { (() => {
function Chip({
  on = false,
  icon,
  children,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: 'fe-chip' + (on ? ' on' : ''),
    "aria-pressed": on,
    onClick: onClick
  }, icon && /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 16
  }), children);
}
Object.assign(__ds_scope, { Chip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Chip.jsx", error: String((e && e.message) || e) }); }

// components/core/EmptyState.jsx
try { (() => {
function EmptyState({
  icon = 'paw-print',
  title,
  body,
  action,
  onAction,
  tone
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'center',
      padding: '32px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "fe-ph",
    style: {
      width: 112,
      height: 112,
      borderRadius: '50%',
      color: tone === 'danger' ? 'var(--danger)' : 'var(--primary)'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 44
  })), /*#__PURE__*/React.createElement("div", {
    className: "t-h3"
  }, title), body && /*#__PURE__*/React.createElement("div", {
    className: "t-cap",
    style: {
      maxWidth: 280,
      fontSize: 'var(--fs-body)'
    }
  }, body), action && /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: tone === 'danger' ? 'outline' : 'primary',
    size: "m",
    onClick: onAction
  }, action));
}
Object.assign(__ds_scope, { EmptyState });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/EmptyState.jsx", error: String((e && e.message) || e) }); }

// components/core/IconButton.jsx
try { (() => {
function IconButton({
  icon,
  label,
  badge,
  plain = false,
  flip = false,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: 'fe-iconbtn' + (plain ? ' plain' : ''),
    "aria-label": label,
    title: label,
    onClick: onClick
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 22,
    flip: flip
  }), badge ? /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      top: 6,
      insetInlineEnd: 6,
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      background: 'var(--danger)',
      color: 'var(--on-danger)',
      fontSize: 10,
      fontWeight: 700,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 4px'
    }
  }, badge) : null);
}
Object.assign(__ds_scope, { IconButton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/IconButton.jsx", error: String((e && e.message) || e) }); }

// components/core/Input.jsx
try { (() => {
function Input({
  label,
  hint,
  error,
  icon,
  value,
  defaultValue,
  placeholder,
  disabled,
  type = 'text',
  inputMode,
  ltr = false,
  onChange,
  prefix
}) {
  return /*#__PURE__*/React.createElement("label", {
    className: "fe-field"
  }, label && /*#__PURE__*/React.createElement("span", {
    className: "fe-label"
  }, label), /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      gap: 8
    }
  }, prefix && /*#__PURE__*/React.createElement("span", {
    className: "fe-input",
    style: {
      width: 'auto',
      display: 'flex',
      alignItems: 'center',
      direction: 'ltr',
      flex: 'none'
    }
  }, prefix), icon && /*#__PURE__*/React.createElement("span", {
    style: {
      position: 'absolute',
      insetInlineStart: 14,
      color: 'var(--text-secondary)',
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 20
  })), /*#__PURE__*/React.createElement("input", {
    className: 'fe-input' + (error ? ' error' : ''),
    style: {
      paddingInlineStart: icon ? 44 : 14,
      direction: ltr ? 'ltr' : undefined,
      textAlign: ltr ? 'start' : undefined
    },
    type: type,
    inputMode: inputMode,
    value: value,
    defaultValue: defaultValue,
    placeholder: placeholder,
    disabled: disabled,
    onChange: onChange,
    "aria-invalid": !!error
  })), (error || hint) && /*#__PURE__*/React.createElement("span", {
    className: 'fe-hint' + (error ? ' error' : '')
  }, error || hint));
}
Object.assign(__ds_scope, { Input });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Input.jsx", error: String((e && e.message) || e) }); }

// components/core/PhaseTag.jsx
try { (() => {
function PhaseTag({
  phase = 2,
  children
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: "fe-phase"
  }, children || 'Later phase · ' + phase);
}
Object.assign(__ds_scope, { PhaseTag });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/PhaseTag.jsx", error: String((e && e.message) || e) }); }

// components/core/Rating.jsx
try { (() => {
function Rating({
  value = 0,
  size = 18,
  onChange
}) {
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      gap: 2,
      color: 'var(--warning)'
    },
    dir: "ltr"
  }, [1, 2, 3, 4, 5].map(n => /*#__PURE__*/React.createElement("span", {
    key: n,
    onClick: onChange ? () => onChange(n) : undefined,
    style: {
      cursor: onChange ? 'pointer' : undefined,
      opacity: n <= Math.round(value) ? 1 : .3,
      display: 'flex'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "star",
    size: size,
    style: {
      background: n <= Math.round(value) ? 'currentColor' : 'currentColor'
    }
  }))));
}
Object.assign(__ds_scope, { Rating });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Rating.jsx", error: String((e && e.message) || e) }); }

// components/core/Skeleton.jsx
try { (() => {
function Skeleton({
  w = '100%',
  h = 16,
  r
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "fe-skel",
    style: {
      width: w,
      height: h,
      borderRadius: r
    }
  });
}
Object.assign(__ds_scope, { Skeleton });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/Skeleton.jsx", error: String((e && e.message) || e) }); }

// components/core/StatusBadge.jsx
try { (() => {
const MAP = {
  pending: 'warning',
  confirmed: 'info',
  checked_in: 'primary',
  in_progress: 'info',
  completed: 'success',
  cancelled: 'neutral',
  no_show: 'danger',
  up_to_date: 'success',
  due_soon: 'warning',
  overdue: 'danger',
  verified: 'success',
  self_reported: 'neutral'
};
function StatusBadge({
  status,
  children
}) {
  return /*#__PURE__*/React.createElement("span", {
    className: 'fe-badge ' + (MAP[status] || 'neutral')
  }, /*#__PURE__*/React.createElement("i", null), children);
}
Object.assign(__ds_scope, { StatusBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/core/StatusBadge.jsx", error: String((e && e.message) || e) }); }

// components/domain/ClinicCard.jsx
try { (() => {
function ClinicCard({
  name,
  distance,
  rating,
  next,
  nextLabel,
  badge,
  onClick
}) {
  return /*#__PURE__*/React.createElement(__ds_scope.Card, {
    onClick: onClick,
    pad: 12,
    style: {
      display: 'flex',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "fe-ph",
    style: {
      width: 64,
      height: 64,
      borderRadius: 14,
      flex: 'none'
    }
  }, "logo"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      gap: 8
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "t-h3",
    style: {
      fontSize: 'var(--fs-body-lg)'
    }
  }, name), badge), /*#__PURE__*/React.createElement("div", {
    className: "t-cap",
    style: {
      display: 'flex',
      gap: 12
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 4,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "map-pin",
    size: 14
  }), /*#__PURE__*/React.createElement("span", {
    dir: "ltr"
  }, distance)), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'flex',
      gap: 4,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "star",
    size: 14,
    style: {
      color: 'var(--warning)'
    }
  }), /*#__PURE__*/React.createElement("span", {
    dir: "ltr"
  }, rating))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-caption)',
      color: 'var(--success)',
      fontWeight: 500
    }
  }, nextLabel, " ", /*#__PURE__*/React.createElement("span", {
    dir: "ltr"
  }, next))));
}
Object.assign(__ds_scope, { ClinicCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/domain/ClinicCard.jsx", error: String((e && e.message) || e) }); }

// components/domain/ConfirmSheet.jsx
try { (() => {
function ConfirmSheet({
  title,
  body,
  confirm,
  cancel,
  destructive = true,
  onConfirm,
  onCancel,
  children
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "fe-sheet-bd",
    onClick: onCancel
  }, /*#__PURE__*/React.createElement("div", {
    className: "fe-sheet",
    onClick: e => e.stopPropagation(),
    role: "dialog",
    "aria-modal": "true"
  }, /*#__PURE__*/React.createElement("div", {
    className: "t-h2",
    style: {
      marginBottom: 6
    }
  }, title), body && /*#__PURE__*/React.createElement("div", {
    style: {
      color: 'var(--text-secondary)',
      marginBottom: 16
    }
  }, body), children, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 8,
      marginTop: 8
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: destructive ? 'destructive' : 'primary',
    block: true,
    onClick: onConfirm
  }, confirm), /*#__PURE__*/React.createElement(__ds_scope.Button, {
    variant: "secondary",
    block: true,
    onClick: onCancel
  }, cancel))));
}
Object.assign(__ds_scope, { ConfirmSheet });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/domain/ConfirmSheet.jsx", error: String((e && e.message) || e) }); }

// components/domain/PetCard.jsx
try { (() => {
function PetCard({
  name,
  breed,
  age,
  status,
  statusLabel,
  onClick
}) {
  return /*#__PURE__*/React.createElement(__ds_scope.Card, {
    onClick: onClick,
    pad: 12,
    style: {
      display: 'flex',
      gap: 12,
      alignItems: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "fe-ph",
    style: {
      width: 64,
      height: 64,
      borderRadius: 14,
      flex: 'none'
    }
  }, "photo"), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "t-h3",
    style: {
      fontSize: 'var(--fs-body-lg)'
    }
  }, name), /*#__PURE__*/React.createElement("div", {
    className: "t-cap"
  }, breed, " \xB7 ", age), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 6
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.StatusBadge, {
    status: status
  }, statusLabel))), /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-right",
    flip: true,
    size: 20,
    style: {
      color: 'var(--text-secondary)'
    }
  }));
}
Object.assign(__ds_scope, { PetCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/domain/PetCard.jsx", error: String((e && e.message) || e) }); }

// components/domain/SlotChip.jsx
try { (() => {
function SlotChip({
  time,
  on = false,
  disabled = false,
  onClick
}) {
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: 'fe-slot' + (on ? ' on' : ''),
    disabled: disabled,
    onClick: onClick
  }, /*#__PURE__*/React.createElement("span", {
    dir: "ltr"
  }, time));
}
Object.assign(__ds_scope, { SlotChip });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/domain/SlotChip.jsx", error: String((e && e.message) || e) }); }

// components/domain/Stepper.jsx
try { (() => {
function Stepper({
  steps,
  current = 0
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 6
    }
  }, steps.map((s, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 6,
      flex: 'none',
      minWidth: 56
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: 24,
      height: 24,
      borderRadius: '50%',
      background: i <= current ? 'var(--primary)' : 'var(--surface-secondary)',
      color: i <= current ? 'var(--on-primary)' : 'var(--text-secondary)',
      fontSize: 12,
      fontWeight: 600,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, i + 1), /*#__PURE__*/React.createElement("span", {
    className: "t-cap",
    style: {
      color: i === current ? 'var(--text-primary)' : undefined,
      fontWeight: i === current ? 600 : 400,
      textAlign: 'center'
    }
  }, s)), i < steps.length - 1 && /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      height: 2,
      background: i < current ? 'var(--primary)' : 'var(--border)',
      marginBottom: 20
    }
  }))));
}
Object.assign(__ds_scope, { Stepper });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/domain/Stepper.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Avatar = __ds_scope.Avatar;

__ds_ns.Banner = __ds_scope.Banner;

__ds_ns.Button = __ds_scope.Button;

__ds_ns.Card = __ds_scope.Card;

__ds_ns.Chip = __ds_scope.Chip;

__ds_ns.EmptyState = __ds_scope.EmptyState;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.IconButton = __ds_scope.IconButton;

__ds_ns.Input = __ds_scope.Input;

__ds_ns.PhaseTag = __ds_scope.PhaseTag;

__ds_ns.Rating = __ds_scope.Rating;

__ds_ns.Skeleton = __ds_scope.Skeleton;

__ds_ns.StatusBadge = __ds_scope.StatusBadge;

__ds_ns.ClinicCard = __ds_scope.ClinicCard;

__ds_ns.ConfirmSheet = __ds_scope.ConfirmSheet;

__ds_ns.PetCard = __ds_scope.PetCard;

__ds_ns.SlotChip = __ds_scope.SlotChip;

__ds_ns.Stepper = __ds_scope.Stepper;

})();
