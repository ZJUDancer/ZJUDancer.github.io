document.addEventListener("DOMContentLoaded", function () {
  const pageType = document.body.dataset.page;
  const navRoot = document.getElementById("doc-nav");
  const contentRoot = document.getElementById("doc-content");
  const tocRoot = document.getElementById("doc-toc-list");
  const tocContainer = document.querySelector(".doc-toc");

  const NAV_DATA = pageType === "documents" ? DOCUMENTS_NAV : TUTORIALS_NAV;
  const viewerInstance = initImageViewer();

  function getFileType(file) {
    if (!file) return "";
    return file.split(".").pop().toLowerCase();
  }

  function getFileName(file) {
    if (!file) return "";
    return file.split("/").pop();
  }

  function createDocToolbar(file, label = "Download File") {
    const fileName = getFileName(file);
    return `
      <div class="doc-toolbar">
        <a href="${file}" target="_blank" class="button small">Open File</a>
        <a href="${file}" download="${fileName}" class="button small">${label}</a>
      </div>
    `;
  }

  function slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\u4e00-\u9fa5\s-]/g, "")
      .replace(/\s+/g, "-");
  }

  function assignHeadingIds(root) {
    const headings = root.querySelectorAll("h1, h2, h3, h4");
    const usedIds = new Map();

    headings.forEach((heading) => {
      const rawText = heading.textContent.trim();
      let baseId = slugify(rawText);

      if (!baseId) {
        baseId = "section";
      }

      const count = usedIds.get(baseId) || 0;
      usedIds.set(baseId, count + 1);

      const finalId = count === 0 ? baseId : `${baseId}-${count}`;
      heading.id = finalId;
    });
  }

  function buildTOC(root) {
    if (!tocRoot || !tocContainer) return;

    tocRoot.innerHTML = "";

    const headings = Array.from(root.querySelectorAll("h1, h2, h3, h4"));

    if (!headings.length) {
      tocContainer.style.display = "none";
      return;
    }

    tocContainer.style.display = "";

    const nodes = headings.map((heading) => ({
      id: heading.id,
      text: heading.textContent.trim(),
      level: Number(heading.tagName.charAt(1)),
      children: []
    }));

    const tree = [];
    const stack = [];

    nodes.forEach((node) => {
      while (stack.length && stack[stack.length - 1].level >= node.level) {
        stack.pop();
      }

      if (stack.length) {
        stack[stack.length - 1].children.push(node);
      } else {
        tree.push(node);
      }

      stack.push(node);
    });

    const currentDocId = new URLSearchParams(window.location.search).get("doc");

    function createScrollHandler(id) {
      return function (e) {
        e.preventDefault();
        const target = document.getElementById(id);
        if (!target) return;

        target.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });

        const url = currentDocId
          ? `?doc=${encodeURIComponent(currentDocId)}#${id}`
          : `#${id}`;

        history.replaceState(null, "", url);
      };
    }

    function renderNodes(nodeList, parentEl) {
      nodeList.forEach((node) => {
        const item = document.createElement("div");
        item.className = `toc-item toc-level-${node.level}`;

        const hasChildren = node.children && node.children.length > 0;

        if (hasChildren && (node.level === 2 || node.level === 3)) {
          item.classList.add("toc-collapsible", "open");

          const row = document.createElement("div");
          row.className = "toc-row";

          const link = document.createElement("a");
          link.href = `#${node.id}`;
          link.className = "toc-link toc-node-link";
          link.textContent = node.text;
          link.addEventListener("click", createScrollHandler(node.id));

          const toggle = document.createElement("button");
          toggle.type = "button";
          toggle.className = "toc-toggle";
          toggle.setAttribute("aria-expanded", "true");
          toggle.textContent = "▾";

          toggle.addEventListener("click", function (e) {
            e.stopPropagation();
            const isOpen = item.classList.contains("open");
            item.classList.toggle("open", !isOpen);
            toggle.setAttribute("aria-expanded", String(!isOpen));
          });

          row.appendChild(link);
          row.appendChild(toggle);

          const children = document.createElement("div");
          children.className = "toc-children";

          renderNodes(node.children, children);

          item.appendChild(row);
          item.appendChild(children);
        } else {
          const link = document.createElement("a");
          link.href = `#${node.id}`;
          link.className = "toc-link toc-node-link";
          link.textContent = node.text;
          link.addEventListener("click", createScrollHandler(node.id));

          item.appendChild(link);

          if (hasChildren) {
            const children = document.createElement("div");
            children.className = "toc-children";

            renderNodes(node.children, children);
            item.appendChild(children);
          }
        }

        parentEl.appendChild(item);
      });
    }

    renderNodes(tree, tocRoot);
  }

  function hideTOC() {
    if (!tocContainer) return;
    tocContainer.style.display = "none";
    if (tocRoot) tocRoot.innerHTML = "";
  }

  async function renderMermaidInContent(root) {
    if (!window.mermaid) {
      console.warn("Mermaid is not loaded.");
      return;
    }

    const mermaidBlocks = root.querySelectorAll("pre code.language-mermaid");

    for (let i = 0; i < mermaidBlocks.length; i++) {
      const codeBlock = mermaidBlocks[i];
      const pre = codeBlock.parentElement;
      const graphDefinition = codeBlock.textContent.trim();
      const renderId = `mermaid-${Date.now()}-${i}`;

      try {
        const { svg } = await window.mermaid.render(renderId, graphDefinition);

        const wrapper = document.createElement("div");
        wrapper.className = "mermaid-wrapper";

        wrapper.innerHTML = `
          <div class="mermaid-preview">
            ${svg}
          </div>
        `;

        pre.replaceWith(wrapper);
      } catch (error) {
        console.error("Mermaid render error:", error);

        const errorBox = document.createElement("div");
        errorBox.className = "mermaid-error";
        errorBox.innerHTML = `
          <p><strong>Mermaid 渲染失败</strong></p>
          <pre>${graphDefinition}</pre>
        `;
        pre.replaceWith(errorBox);
      }
    }
  }
function normalizeMathDelimiters(markdown) {
  // 1. 处理块级公式：独占一行的 $$...$$ 保留
  // 2. 处理行内公式：把同一行中的 $$...$$ 转成 \( ... \)

  const lines = markdown.split("\n");
  const result = [];
  let inBlockMath = false;

  for (let line of lines) {
    const trimmed = line.trim();

    // 遇到单独一行的 $$，认为进入/退出块级公式
    if (trimmed === "$$") {
      inBlockMath = !inBlockMath;
      result.push(line);
      continue;
    }

    if (!inBlockMath) {
      // 只处理非块级区域中的行内 $$...$$
      line = line.replace(/\$\$([^$\n]+?)\$\$/g, "\\($1\\)");
    }

    result.push(line);
  }

  return result.join("\n");
}

async function renderMarkdown(file) {
  contentRoot.className = "doc-content markdown-body";
  contentRoot.innerHTML = `
    ${createDocToolbar(file, "Download Markdown")}
    <p>Loading markdown...</p>
  `;

  try {
    const response = await fetch(file);
    if (!response.ok) throw new Error("Failed to load markdown");

    const rawText = await response.text();
    const text = normalizeMathDelimiters(rawText);


    contentRoot.innerHTML = `
      ${createDocToolbar(file, "Download Markdown")}
      <div class="doc-markdown-body">
        ${marked.parse(text)}
      </div>
    `;

    const markdownBody = contentRoot.querySelector(".doc-markdown-body");

    renderMathInContent(markdownBody);
    assignHeadingIds(markdownBody);
    await renderMermaidInContent(markdownBody);
    buildTOC(markdownBody);
    bindZoomableMedia(markdownBody, viewerInstance);

  } catch (error) {
    contentRoot.innerHTML = `
      ${createDocToolbar(file, "Download Markdown")}
      <p>Failed to load document: ${error.message}</p>
    `;
    hideTOC();
  }
}


  function renderPDF(file) {
    hideTOC();

    contentRoot.className = "doc-content";
    contentRoot.innerHTML = `
      <div class="doc-toolbar">
        <a href="${file}" target="_blank" class="button small">Open PDF in New Tab</a>
        <a href="${file}" download="${getFileName(file)}" class="button small">Download PDF</a>
      </div>
      <iframe class="pdf-frame" src="${file}"></iframe>
    `;
  }

  function loadDocument(item) {
    if (!item || !item.file) return;

    const type = getFileType(item.file);

    if (type === "md") {
      renderMarkdown(item.file);
    } else if (type === "pdf") {
      renderPDF(item.file);
    } else {
      hideTOC();

      contentRoot.className = "doc-content";
      contentRoot.innerHTML = `
        <div class="doc-toolbar">
          <a href="${item.file}" target="_blank" class="button small">Open File</a>
          <a href="${item.file}" download="${getFileName(item.file)}" class="button small">Download File</a>
        </div>
        <p>This file type is not previewable in the current page.</p>
      `;
    }

    if (item.docId) {
      history.replaceState(null, "", `?doc=${encodeURIComponent(item.docId)}`);
    }
  }

  function closeAllLinks() {
    document.querySelectorAll(".doc-link").forEach(el => {
      el.classList.remove("active");
    });
  }

  function openAncestorGroups(element) {
    let current = element.parentElement;
    while (current) {
      if (current.classList.contains("doc-subnav")) {
        current.classList.add("open");
      }

      if (current.classList.contains("doc-nav-item")) {
        const toggle = current.querySelector(":scope > .doc-nav-toggle");
        if (toggle) toggle.classList.add("open");
      }

      current = current.parentElement;
    }
  }

  function activateLink(link, item) {
    closeAllLinks();
    link.classList.add("active");
    loadDocument(item);
    openAncestorGroups(link);
  }

  function createNavNode(item, level = 0) {
    const wrapper = document.createElement("div");
    wrapper.className = `doc-nav-item level-${level}`;

    if (item.children && item.children.length > 0) {
      const toggle = document.createElement("button");
      toggle.className = "doc-nav-toggle";
      toggle.type = "button";
      toggle.textContent = item.title;

      const subList = document.createElement("div");
      subList.className = "doc-subnav";

      item.children.forEach(child => {
        subList.appendChild(createNavNode(child, level + 1));
      });

      toggle.addEventListener("click", function (e) {
        e.stopPropagation();
        const isOpen = subList.classList.contains("open");
        subList.classList.toggle("open", !isOpen);
        toggle.classList.toggle("open", !isOpen);
      });

      wrapper.appendChild(toggle);
      wrapper.appendChild(subList);
    } else if (item.file) {
      const link = document.createElement("button");
      link.className = "doc-link";
      link.type = "button";
      link.textContent = item.title;
      link.dataset.docId = item.docId || "";

      link.addEventListener("click", function (e) {
        e.stopPropagation();
        activateLink(link, item);
      });

      wrapper.appendChild(link);
    }

    return wrapper;
  }

  function findFirstDoc(items) {
    for (const item of items) {
      if (item.children && item.children.length > 0) {
        const found = findFirstDoc(item.children);
        if (found) return found;
      } else if (item.file) {
        return item;
      }
    }
    return null;
  }

  function findItemByDocId(items, docId) {
    for (const item of items) {
      if (item.children && item.children.length > 0) {
        const found = findItemByDocId(item.children, docId);
        if (found) return found;
      } else if (item.docId === docId) {
        return item;
      }
    }
    return null;
  }

  function findLinkByDocId(docId) {
    return document.querySelector(`.doc-link[data-doc-id="${docId}"]`);
  }

  NAV_DATA.forEach(item => {
    navRoot.appendChild(createNavNode(item, 0));
  });

  const params = new URLSearchParams(window.location.search);
  const targetDocId = params.get("doc");

  if (targetDocId) {
    const targetItem = findItemByDocId(NAV_DATA, targetDocId);
    const targetLink = findLinkByDocId(targetDocId);

    if (targetItem && targetLink) {
      targetLink.classList.add("active");
      loadDocument(targetItem);
      openAncestorGroups(targetLink);
      return;
    }
  }

  const defaultDoc = findFirstDoc(NAV_DATA);
  if (defaultDoc) {
    const defaultLink = findLinkByDocId(defaultDoc.docId);
    if (defaultLink) {
      defaultLink.classList.add("active");
      loadDocument(defaultDoc);
      openAncestorGroups(defaultLink);
    }
  }
});

function initImageViewer() {
  const viewer = document.getElementById("image-viewer");
  if (!viewer) return null;

  const backdrop = viewer.querySelector(".image-viewer-backdrop");
  const stageWrap = viewer.querySelector(".image-viewer-stage-wrap");
  const stage = viewer.querySelector(".image-viewer-stage");
  const zoomInBtn = viewer.querySelector('[data-action="zoom-in"]');
  const zoomOutBtn = viewer.querySelector('[data-action="zoom-out"]');
  const resetBtn = viewer.querySelector('[data-action="reset"]');
  const closeBtn = viewer.querySelector('[data-action="close"]');

  let scale = 1;
  let translateX = 0;
  let translateY = 0;
  let isDragging = false;
  let startX = 0;
  let startY = 0;
  let activeNode = null;

  function applyTransform() {
    stage.style.transform = `translate(-50%, -50%) translate(${translateX}px, ${translateY}px) scale(${scale})`;
  }

  function resetTransform() {
    scale = 1;
    translateX = 0;
    translateY = 0;
    applyTransform();
  }

  function open(node) {
    stage.innerHTML = "";
    const clone = node.cloneNode(true);

    if (clone.tagName && clone.tagName.toLowerCase() === "img") {
      clone.removeAttribute("width");
      clone.removeAttribute("height");
    }

    stage.appendChild(clone);
    activeNode = clone;
    viewer.classList.add("open");
    viewer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    resetTransform();
  }

  function close() {
    viewer.classList.remove("open");
    viewer.setAttribute("aria-hidden", "true");
    stage.innerHTML = "";
    document.body.style.overflow = "";
    activeNode = null;
  }

  zoomInBtn.addEventListener("click", () => {
    scale = Math.min(scale + 0.1, 5);
    applyTransform();
  });

  zoomOutBtn.addEventListener("click", () => {
    scale = Math.max(scale - 0.1, 0.2);
    applyTransform();
  });

  resetBtn.addEventListener("click", () => {
    resetTransform();
  });

  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", close);

  stageWrap.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();

      if (e.deltaY < 0) {
        scale = Math.min(scale + 0.1, 5);
      } else {
        scale = Math.max(scale - 0.1, 0.2);
      }

      applyTransform();
    },
    { passive: false }
  );

  stageWrap.addEventListener("mousedown", (e) => {
    if (!activeNode) return;
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    stageWrap.classList.add("dragging");
  });

  window.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    applyTransform();
  });

  window.addEventListener("mouseup", () => {
    isDragging = false;
    stageWrap.classList.remove("dragging");
  });

  viewer.addEventListener("dblclick", () => {
    resetTransform();
  });

  window.addEventListener("keydown", (e) => {
    if (!viewer.classList.contains("open")) return;

    if (e.key === "Escape") {
      close();
    }
  });

  return { open, close };
}

function bindZoomableMedia(root, viewerInstance) {
  if (!root || !viewerInstance) return;

  const images = root.querySelectorAll("img");
  images.forEach((img) => {
    img.style.cursor = "zoom-in";
    img.addEventListener("click", () => {
      viewerInstance.open(img);
    });
  });

  const mermaidSvgs = root.querySelectorAll(".mermaid-wrapper svg");
  mermaidSvgs.forEach((svg) => {
    svg.style.cursor = "zoom-in";
    svg.addEventListener("click", () => {
      viewerInstance.open(svg);
    });
  });
}

function setupMermaidZoom(wrapper) {
  const stage = wrapper.querySelector(".mermaid-stage");
  const zoomInBtn = wrapper.querySelector('[data-action="zoom-in"]');
  const zoomOutBtn = wrapper.querySelector('[data-action="zoom-out"]');
  const resetBtn = wrapper.querySelector('[data-action="reset"]');

  let scale = 1;

  function applyTransform() {
    stage.style.transform = `scale(${scale})`;
  }

  zoomInBtn.addEventListener("click", () => {
    scale = Math.min(scale + 0.1, 3);
    applyTransform();
  });

  zoomOutBtn.addEventListener("click", () => {
    scale = Math.max(scale - 0.1, 0.4);
    applyTransform();
  });

  resetBtn.addEventListener("click", () => {
    scale = 1;
    applyTransform();
  });

  const viewport = wrapper.querySelector(".mermaid-viewport");
  viewport.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();

      if (e.deltaY < 0) {
        scale = Math.min(scale + 0.1, 3);
      } else {
        scale = Math.max(scale - 0.1, 0.4);
      }

      applyTransform();
    },
    { passive: false }
  );

  applyTransform();
}
function renderMathInContent(root) {
  if (!root || !window.renderMathInElement) {
    console.warn("KaTeX auto-render is not loaded.");
    return;
  }

window.renderMathInElement(root, {
  delimiters: [
    { left: "$$", right: "$$", display: true },
    { left: "\\(", right: "\\)", display: false }
  ],
  throwOnError: false
});

}
