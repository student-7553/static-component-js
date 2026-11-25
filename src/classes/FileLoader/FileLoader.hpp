#pragma once
#include "vector"
#include "string"

struct ComponentFile
{
public:
    std::string filePath;
    std::string fileName;
    std::string fileExtension;
};

class FileLoader
{

public:
    FileLoader(std::string _rootFolderPath);
    void init();
    std::vector<ComponentFile> *getFiles();

private:
    std::vector<ComponentFile> componentFiles;
    std::string rootFolderPath;
};