import { useEffect, useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  Check,
  Clock,
  Eye,
  FileText,
  Folder,
  Pencil,
  Trash2,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useStore } from '@/lib/store'
import { formatSize, type Route } from '@/types'

/** 极简 Markdown 渲染（标题 / 列表 / 代码块 / 粗体），用于预览 */
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((p, i) =>
    p.startsWith('**') && p.endsWith('**') ? (
      <strong key={`${keyPrefix}-${i}`}>{p.slice(2, -2)}</strong>
    ) : (
      <span key={`${keyPrefix}-${i}`}>{p}</span>
    ),
  )
}

function MarkdownView({ content }: { content: string }) {
  const lines = content.split('\n')
  const blocks: ReactNode[] = []
  let listBuf: string[] = []
  let codeBuf: string[] = []
  let inCode = false

  const flushList = () => {
    if (listBuf.length) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="my-3 list-disc space-y-1 pl-6">
          {listBuf.map((li, i) => (
            <li key={i}>{renderInline(li, `li-${blocks.length}-${i}`)}</li>
          ))}
        </ul>,
      )
      listBuf = []
    }
  }

  lines.forEach((raw, idx) => {
    const line = raw.trimEnd()
    if (line.startsWith('```')) {
      if (inCode) {
        blocks.push(
          <pre
            key={`code-${idx}`}
            className="my-3 overflow-auto rounded-lg bg-slate-950 p-4 text-sm leading-relaxed text-slate-100"
          >
            <code>{codeBuf.join('\n')}</code>
          </pre>,
        )
        codeBuf = []
        inCode = false
      } else {
        flushList()
        inCode = true
      }
      return
    }
    if (inCode) {
      codeBuf.push(raw)
      return
    }
    if (line.startsWith('- ')) {
      listBuf.push(line.slice(2))
      return
    }
    flushList()
    if (/^### /.test(line)) {
      blocks.push(
        <h3 key={idx} className="mb-2 mt-6 text-base font-semibold">
          {renderInline(line.slice(4), `h3-${idx}`)}
        </h3>,
      )
    } else if (/^## /.test(line)) {
      blocks.push(
        <h2 key={idx} className="mb-3 mt-8 border-b pb-2 text-lg font-semibold">
          {renderInline(line.slice(3), `h2-${idx}`)}
        </h2>,
      )
    } else if (/^# /.test(line)) {
      blocks.push(
        <h1 key={idx} className="mb-4 mt-2 text-2xl font-bold">
          {renderInline(line.slice(2), `h1-${idx}`)}
        </h1>,
      )
    } else if (line.trim() === '') {
      // skip
    } else {
      blocks.push(
        <p key={idx} className="my-2 leading-7 text-slate-700">
          {renderInline(line, `p-${idx}`)}
        </p>,
      )
    }
  })
  flushList()
  if (inCode && codeBuf.length) {
    blocks.push(
      <pre key="code-tail" className="my-3 overflow-auto rounded-lg bg-slate-950 p-4 text-sm text-slate-100">
        <code>{codeBuf.join('\n')}</code>
      </pre>,
    )
  }
  return <div>{blocks}</div>
}

export function DocPage({ docId, navigate }: { docId: string; navigate: (r: Route) => void }) {
  const store = useStore()
  const doc = store.docs.find((d) => d.id === docId)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  useEffect(() => {
    if (doc) {
      setTitle(doc.title)
      setContent(doc.content)
    }
  }, [doc?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!doc) {
    return (
      <div className="p-6">
        <div className="text-sm text-muted-foreground">文档不存在或已被删除。</div>
        <Button variant="outline" className="mt-4 cursor-pointer" onClick={() => navigate({ name: 'spaces' })}>
          返回知识库
        </Button>
      </div>
    )
  }

  const space = store.spaces.find((s) => s.id === doc.spaceId)
  const folder = doc.nodeId !== 'root' ? store.nodes.find((n) => n.id === doc.nodeId) : null

  const save = () => {
    if (!title.trim()) {
      toast.error('请输入文档标题')
      return
    }
    store.updateDoc(doc.id, { title: title.trim(), content })
    toast.success('文档已保存')
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      {/* 顶部信息 */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Button variant="ghost" size="sm" className="cursor-pointer" onClick={() => navigate({ name: 'space', id: doc.spaceId })}>
            <ArrowLeft className="mr-1 h-4 w-4" />
            返回{space?.name ?? '知识库'}
          </Button>
          <Separator orientation="vertical" className="h-4" />
          {space && (
            <Badge variant="secondary" className="gap-1">
              {space.name}
            </Badge>
          )}
          {folder && (
            <Badge variant="outline" className="gap-1">
              <Folder className="h-3 w-3" /> {folder.name}
            </Badge>
          )}
          {doc.fileType && <Badge variant="secondary">{doc.fileType}</Badge>}
          {doc.fileName && (
            <span className="text-xs">
              {doc.fileName}（{formatSize(doc.fileSize)}）
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            更新于 {new Date(doc.updatedAt).toLocaleString('zh-CN')}
          </span>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer text-destructive hover:text-destructive"
            onClick={() => {
              store.deleteDoc(doc.id)
              toast.success('文档已删除')
              navigate({ name: 'space', id: doc.spaceId })
            }}
          >
            <Trash2 className="mr-1 h-4 w-4" />
            删除
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <Tabs defaultValue="view">
            <div className="mb-4 flex items-center justify-between gap-3">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-transparent bg-transparent px-0 text-2xl font-bold shadow-none focus-visible:border-slate-200 focus-visible:shadow-sm"
                placeholder="输入文档标题"
              />
              <TabsList className="shrink-0">
                <TabsTrigger value="view" className="cursor-pointer gap-1">
                  <Eye className="h-3.5 w-3.5" /> 预览
                </TabsTrigger>
                <TabsTrigger value="edit" className="cursor-pointer gap-1">
                  <Pencil className="h-3.5 w-3.5" /> 编辑
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="view">
              <div className="min-h-96">
                {content.trim() ? (
                  <MarkdownView content={content} />
                ) : (
                  <div className="flex min-h-96 flex-col items-center justify-center gap-2 text-muted-foreground">
                    <FileText className="h-10 w-10 opacity-30" />
                    <span className="text-sm">暂无内容，切换到「编辑」开始撰写</span>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="edit">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={20}
                className="min-h-96 font-mono text-sm leading-6"
                placeholder={'支持 Markdown 语法：\n# 一级标题\n## 二级标题\n- 列表项\n**加粗文本**'}
              />
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  支持 Markdown：标题、列表、代码块、加粗
                </span>
                <Button className="cursor-pointer" onClick={save}>
                  <Check className="mr-2 h-4 w-4" />
                  保存文档
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
