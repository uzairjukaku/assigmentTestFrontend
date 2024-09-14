import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import { Button, notification, Select, Table } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { DatePicker, Space } from "antd";
const { RangePicker } = DatePicker;
const columns = [
  {
    title: "Instructor",
    dataIndex: "instructor",
    key: "instructor",
  },
  {
    title: "Class Name",
    dataIndex: "Class Name",
    key: "Class Name",
  },
  {
    title: "Students",
    key: "Students",
    dataIndex: "Students",
  },
  {
    title: "Date",
    dataIndex: "date",
    key: "date",
  },
];

function App() {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [classData, setClassData] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [data2, setData2] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [dateRange, setDateRange] = useState();
  const [dateRange2, setDateRange2] = useState();
  const [instructor, setInstructor] = useState("");

  useEffect(() => {
    handleGraphChange();
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/class-schedules/all"
        );

        setClassData(response.data.data);
        setFilteredData(response.data.data);
      } catch (error) {
        console.error("Error fetching class schedules:", error);
      }
    };
    fetchData();
    const instructor = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/class-schedules/instructor"
        );

        setInstructors(response.data.data);
      } catch (error) {
        console.error("Error fetching Instructors:", error);
      }
    };
    instructor();
  }, []);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "http://localhost:3000/class-schedules/upload",
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      if (response.status === 200) {
        console.log("====================================");
        console.log(response.data);
        console.log("====================================");

        response.data.map((item, index) => {
          console.log("====================================");
          console.log(item);
          console.log("====================================");
          openNotification("bottomRight", item.message);
        });

        const newData = await axios.get(
          "http://localhost:3000/class-schedules/all"
        );
        setClassData(newData.data);
        setFilteredData(newData.data);
      } else {
        console.error("Upload failed");
      }
    } catch (error) {
      console.error("Error during file upload:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleFilterChange = async () => {
    try {
      const startDate = dateRange ? dateRange[0].toISOString() : "";
      const endDate = dateRange ? dateRange[1].toISOString() : "";

      const response = await axios.get(
        "http://localhost:3000/class-schedules/all",
        {
          params: {
            startDate,
            endDate,
            instructorId: instructor,
          },
        }
      );

      if (response.data.statusCode == 200) {
        setFilteredData(response.data.data);
      } else {
        console.error("Failed to fetch filtered data");
      }
    } catch (error) {
      console.error("Error fetching filtered data:", error);
    }
  };
  const handleGraphChange = async () => {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); // Start of the current month
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0); // End of the current month

      const startDate = dateRange2
        ? dateRange2[0].toISOString()
        : startOfMonth.toISOString();
      const endDate = dateRange2
        ? dateRange2[1].toISOString()
        : endOfMonth.toISOString();

      const response = await axios.get(
        "http://localhost:3000/class-schedules/classes",
        {
          params: {
            startDate,
            endDate,
          },
        }
      );

      if (response.data.statusCode == 200) {
        setData2(response.data.data);
      } else {
        console.error("Failed to fetch filtered data");
      }
    } catch (error) {
      console.error("Error fetching filtered data:", error);
    }
  };

  const [api, contextHolder] = notification.useNotification();
  const openNotification = async (placement, msg) => {
    api.info({
      message: `Notification`,
      description: msg,
      placement,
    });
  };
  return (
    <div className="container mx-auto p-4">
      {contextHolder}
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="mb-4 border border-blue-400 rounded-lg flex flex-col gap-8 p-10">
        <div>
          <div>CSV Upload</div>
        </div>
        <div className="flex flex-col">
          <input
            type="file"
            onChange={handleFileChange}
            accept=".csv"
            className="mb-2 border border-blue-400 p-2"
          />

          <Button
            type="primary"
            className="w-max"
            onClick={handleUpload}
            disabled={!file || isUploading}
          >
            {isUploading ? `Uploading... ${uploadProgress}%` : "Upload CSV"}
          </Button>
        </div>
      </div>

      <div className="mb-4 border border-blue-400 rounded-lg flex flex-col gap-8 p-10">
        <div>Scheduled Classes </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart
            data={data2}
            margin={{
              top: 10,
              right: 30,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              connectNulls
              type="monotone"
              dataKey="Classes"
              stroke="#8884d8"
              fill="#8884d8"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-4 border border-blue-400 rounded-lg flex flex-col gap-8 p-10">
        <div>Classes Report</div>
        <div className="flex space-x-2 mb-4">
          <Select
            
            style={{ width: 300 }}
          placeholder="Select a Instructor"
            onChange={setInstructor}
            options={instructors.map((instructor) => ({
              value: instructor.id,
              label: instructor.name,
            }))}
          />

          <RangePicker
            showTime={{
              format: "HH:mm",
            }}
            format="YYYY-MM-DD HH:mm"
            onChange={(value, dateString) => {
              setDateRange(value);
            }}
            onOk={() => {}}
          />
          <Button type="primary" onClick={handleFilterChange}>
            Apply Filters
          </Button>
        </div>

        {/* <Table columns={columns} dataSource={filteredData} />
         */}
        <table className="w-full">
          <thead>
            <tr>
              <th>Date</th>
              <th>Instructor</th>
              <th>Class Name</th>
              <th>Students</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length &&
              filteredData.map((item, index) => (
                <tr key={index}>
                  <td>{item.startTime}</td>
                  <td>{item.instructor.name}</td>
                  <td>{item.classType.name}</td>
                  <td>{item.student.name}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
