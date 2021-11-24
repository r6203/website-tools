import React from "react";
import axios from "axios";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { Container, Row, Col } from "reactstrap";
import { ClockIcon, HashtagIcon, ScaleIcon } from "@heroicons/react/outline";

import { Check, Info } from "@website-tools/seo";

const Title = ({ url }: { url: string }) => (
  <h1 className="mb-4">{url.replace("https://", "").replace("http://", "")}</h1>
);

const Stats = ({ data: { duration, size, results } }: { data: Check }) => {
  const Header = ({ title, icon }: { title: string; icon?: any }) => (
    <Col md={12} className="bg-light p-2">
      <span className="fw-bold">
        {icon &&
          React.cloneElement(icon, {
            className: "me-1",
            style: { width: "1rem" },
          })}
        <small>{title}</small>
      </span>
    </Col>
  );

  const Data = ({ text }: { text: string }) => (
    <Col md={12}>
      <small>{text}</small>
    </Col>
  );

  const Stat = ({
    title,
    text,
    icon,
  }: {
    title: string;
    text: string;
    icon?: any;
  }) => (
    <Col>
      <Row className="text-center">
        <Header title={title} icon={icon} />
        <Data text={text} />
      </Row>
    </Col>
  );

  const convertSize = (bytes: number, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <div className="mb-5">
      <Row>
        <Stat
          title="Antwortzeit"
          text={(duration / 1000).toString().substring(0, 4) + " s"}
          icon={<ClockIcon />}
        />
        <Stat
          title="Dateigröße"
          text={convertSize(size)}
          icon={<ScaleIcon />}
        />
        {results.wordCount.info && (
          <Stat
            title="Wörter"
            text={results.wordCount.info[0].actual.length}
            icon={<HashtagIcon />}
          />
        )}
      </Row>
    </div>
  );
};

const Meta = ({ data: { results } }: { data: Check }) => {
  const Title = ({ info }: { info: Info }) => (
    <Row className="mb-4">
      <Col xs={3}>
        <span className="fw-bold">
          <small>Titel</small>
        </span>
      </Col>
      <Col>
        <div className="bg-light px-3 py-2">{info.actual.text}</div>
      </Col>
    </Row>
  );

  const MetaDescription = ({ info }: { info: Info }) => (
    <Row className="mb-4">
      <Col xs={3}>
        <span className="fw-bold">
          <small>Meta-Description</small>
        </span>
      </Col>
      <Col>
        <div className="bg-light px-3 py-2">{info.actual.content}</div>
      </Col>
    </Row>
  );

  return (
    <div>
      <h2 className="mb-3">Meta-Angaben im HTML</h2>
      {results.title.info && <Title info={results.title.info[0]} />}
      {results.metaDescription.info && (
        <MetaDescription info={results.metaDescription.info[0]} />
      )}
    </div>
  );
};

const Check = ({ data }: { data: Check }) => {
  const router = useRouter();
  const { site } = router.query;
  const url = site as string;

  return (
    <Container className="mt-4">
      <Title url={url} />
      <Stats data={data} />
      <Meta data={data} />
    </Container>
  );
};

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  if (!params) return { props: {} };
  // TODO refactor

  const url = `http://localhost:3001/seo?url=${params.site}`;
  const { data } = await axios.get<Check>(url);

  return { props: { data } };
};

export default Check;
