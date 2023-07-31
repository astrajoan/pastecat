import React from 'react';

import { AutoSizer, List } from 'react-virtualized';
import { createElement } from 'react-syntax-highlighter';

const rowRenderer = (
  { rows, stylesheet, useInlineStyles, showLineNumbers, language }
) => {
  return ({ index, key, style }) => {
    var node = rows[index];
    if (showLineNumbers && node.children.length > 0) {
      const lineNumberStyle = node.children[0].properties.style;
      if (!lineNumberStyle.paddingLeft) {
        const width = parseFloat(lineNumberStyle.minWidth.slice(0, -2));
        const newWidth = ((width - 0.25) * 0.75).toFixed(2);
        lineNumberStyle.minWidth = `${newWidth}em`;
        lineNumberStyle.paddingLeft = "0.5em";
        node.children[0].properties.style = lineNumberStyle;
      }
    }

    const idx = showLineNumbers ? 1 : 0;
    if (
      language !== "plaintext"
      && node.children.length === idx + 1
      && node.children[idx].type === "text"
      && node.children[idx].value.endsWith("\n")
    ) {
      node.children[idx].properties = { className: ["token", "comment"] };
      node.properties = { className: ["token", "comment"] };
    }

    return createElement({
      node,
      stylesheet,
      style,
      useInlineStyles,
      key,
    });
  };
};

export const virtualizedRenderer = ({
  overscanRowCount = 20,
  rowHeight = 18,
  showLineNumbers = false,
  language = "plaintext",
  boxHeight = 500,
}) => {
  return ({ rows, stylesheet, useInlineStyles }) => (
    <div style={{ height: boxHeight }}>
      <AutoSizer>
        {({ height, width }) => (
          <List
            height={height}
            width={width}
            rowHeight={rowHeight}
            rowRenderer={rowRenderer(
              { rows, stylesheet, useInlineStyles, showLineNumbers, language }
            )}
            rowCount={rows.length}
            overscanRowCount={overscanRowCount}
          />
        )}
      </AutoSizer>
    </div>
  );
};
