const cssPropNamePrefixes = ['O', 'MS', 'Moz', 'Webkit'];

export function getCSSPropertyName(cssDefaultPropName) {
	let cssPropNameSuffix = '';
	const propNameParts = cssDefaultPropName.split('-');
	for(let i = 0, l = propNameParts.length; i< l; i++) {
    cssPropNameSuffix += propNameParts[i].charAt(0).toUpperCase() + propNameParts[i].slice(1);
  }

	const el = document.createElement('div');
	const style = el.style;
	let i = 0, l = cssPropNamePrefixes.length;
	for (; i < l; i++) {
		const cssPrefixedPropName = cssPropNamePrefixes[i] + cssPropNameSuffix;
		if( style[ cssPrefixedPropName ] !== undefined ) {
      return cssPrefixedPropName;
    }
  }
  return cssDefaultPropName; // fallback to standard prop name
}

// Usage:
//var transformCSSPropName = getCSSPropertyName('transform');
