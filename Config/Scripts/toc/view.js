class Toc {
  constructor(markdown) {
    this.markdown = markdown
    this.container = dv.el('div', '')
  }

  getOutline() {
    return this.markdown
      .split('\n')
      .filter((line) => line.match(/^#+\s/))
      .map((heading) => {
        const depth = heading.split(' ')[0].length
        const text = heading.substr(depth + 1)

        return {
          depth,
          text,
          subHeadings: [],
        }
      })
  }

  getHeadings() {
    const toc = []
    const outline = this.getOutline()
    const parentHeadings = new Map()

    outline.forEach((item) => {
      parentHeadings.set(item.depth, item)

      if (item.depth === 2) {
        toc.push(item)
      } else {
        parentHeadings.get(item.depth - 1).subHeadings.push(item)
      }
    })

    return toc
  }

  createItem(heading) {
    return `<li>
      <a data-href="#${heading.text}" href="#${heading.text}" class="internal-link" target="_blank" rel="noopener">${heading.text}</a>
      ${
        heading.subHeadings.length > 0
          ? `

        <ol class="x-toc__list x-toc__list--level${heading.depth + 1}">
          ${heading.subHeadings
            .map((subHeading) => {
              return this.createItem(subHeading)
            })
            .join('')}
        </ol>
          </li>
          `
          : ''
      }`
  }

  createHTML() {
    const headings = this.getHeadings()
    const html = headings
      .map((heading) => {
        return `${this.createItem(heading)}`
      })
      .join('')

    return html
  }

  render() {
    const container = dv.el('div', '')
    const html = this.createHTML()

    container.innerHTML = `<div class="x-toc">

      <div class="x-toc__title">Table of Contents</div>
      <ol class="x-toc__list">${html}</ol>
      </div>`
  }
}

const page = dv.current()
const markdown = await dv.io.load(page.file.path)
const toc = new Toc(markdown)

toc.render()