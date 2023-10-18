import { useCSVReader } from "react-papaparse";
import classnames from "classnames";
import { Container, Button } from "react-bootstrap";
import styles from '@/styles/FileUpload.module.css';

function FileUpload({ updateInputData, jumpTo }) {
    const { CSVReader } = useCSVReader();
    const config = { header: true };
  
    return (
      <>
        <p className={classnames("text-center")}>
          Start by uploading a .csv file with the people you want to match
        </p>
        <CSVReader
          config={config}
          onUploadAccepted={(results) => {
            for (let i = 0; i < results.errors.length; i++) {
              const toRemove = results.errors[i][0].row;
              results.data.splice(toRemove, 1);
            }
            updateInputData(results);
            jumpTo("params");
          }}
        >
          {({ getRootProps, acceptedFile, ProgressBar, getRemoveFileProps }) => (
            <Container>
              <div className={styles.csvReader}>
                <Button
                  type="button"
                  {...getRootProps()}
                  className={classnames("mb-1", styles.btn)}
                >
                  Upload File <i className="ms-1 bi bi-upload"></i>
                </Button>
                <div className={styles.acceptedFile}>
                  {acceptedFile && acceptedFile.name}
                </div>
              </div>
              <ProgressBar className={styles.progressBarBackgroundColor} />
            </Container>
          )}
        </CSVReader>
      </>
    );
  }

  export default FileUpload;