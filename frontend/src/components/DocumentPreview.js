import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const DocumentPreview = ({ document }) => {
  if (!document) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>{document.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Type: {document.type}</p>
        <p>Taille: {document.size} bytes</p>
        {document.description && <p>Description: {document.description}</p>}
      </CardContent>
      <CardFooter>
        <Button asChild>
          <a href={document.url} download={document.title}>
            Télécharger
          </a>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default DocumentPreview

